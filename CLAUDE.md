# CLAUDE.md — Project Knowledge Base

This file documents the architecture, patterns, and decisions in this project for AI assistants and developers working on the codebase.

---

## What This Project Is

A **starter template and course repository** demonstrating how to build a Next.js application powered by Optimizely SaaS CMS using the official SDK and CLI:

- **`@optimizely/cms-sdk`** — fetches content, provides type-safe content type definitions, GraphQL client, and React component registry
- **`@optimizely/cms-cli`** — pushes content type definitions from code to the CMS instance (`npm run opti-push`)

The goal is to show the complete integration pattern: define types in code → push to CMS via CLI → fetch and render content with the SDK.

---

## Tech Stack

| Technology            | Version     | Role                   |
| --------------------- | ----------- | ---------------------- |
| Next.js               | 16          | Framework (App Router) |
| React                 | 19          | UI runtime             |
| `@optimizely/cms-sdk` | ^1.0.0      | CMS integration        |
| `@optimizely/cms-cli` | ^1.0.0      | Content type push CLI  |
| Tailwind CSS          | ^4          | Styling                |
| TypeScript            | ^5 (strict) | Type safety            |
| shadcn/ui + Radix UI  | —           | UI primitives          |

---

## Project Structure

```
app/
  layout.tsx                  # Root layout — imports globals.css and lib/optimizely/init.ts
  [locale]/
    layout.tsx                # Locale layout — HTML shell, Header, Footer, fonts
    page.tsx                  # Homepage — fetches Start Page content from CMS
    [...slug]/page.tsx        # Catch-all — handles every other CMS page
  api/revalidate/route.ts     # POST webhook — triggers cache revalidation on CMS publish
  preview/
    layout.tsx                # Minimal layout for preview mode
    page.tsx                  # Renders unpublished draft content from CMS

components/
  optimizely/
    block/                    # Block-level components (15 blocks)
    page/                     # Page type components (CMSPage, HeaderPage, FooterPage, StartPage)
    experience/               # Experience types (BlankExperience, SEOExperience)
    section/                  # Section types (BlankSection)
  layout/
    header.tsx                # Async Server Component — fetches header content from CMS
    footer.tsx                # Async Server Component — fetches footer content from CMS
    language-switcher.tsx     # 'use client' — interactive locale dropdown
  ui/                         # shadcn/ui components (button, card, avatar, etc.)

lib/
  optimizely/
    init.ts                   # ENTRY POINT — registers all content types and React components
    all-pages.ts              # getAllPagesPaths() — used by generateStaticParams()
    content-types.ts          # AllBlocksContentTypes list used in page/block schemas
    language.ts               # LOCALES, DEFAULT_LOCALE, mapPathWithoutLocale()
  cache/
    cache-keys.ts             # CACHE_KEYS constants + getCacheTag(key, locale) helper
  image/
    loader.ts                 # Custom Cloudinary image loader for next/image
  metadata.ts                 # generateAlternates() — hreflang + canonical URLs
  utils.ts                    # cn(), createUrl(), leadingSlashUrlPath()

proxy.ts                      # Next.js middleware — locale routing and negotiation
optimizely.config.mjs         # CLI config — points to components/optimizely/**/*.tsx
next.config.ts                # cacheComponents: true, custom image loader, security headers
```

---

## Core Patterns

### 1. Content Type Definition

Every block, page, experience, and section defines its schema using `contentType()` from the SDK. This generates TypeScript types AND the schema that the CLI pushes to the CMS.

```typescript
// components/optimizely/block/hero-block.tsx
import { contentType, ContentProps } from '@optimizely/cms-sdk'

export const HeroBlockContentType = contentType({
  key: 'HeroBlock',
  displayName: 'Hero Block',
  baseType: '_component',   // '_component' | '_page' | '_experience' | '_section'
  properties: {
    title: { type: 'string', displayName: 'Title', localized: true },
    showDecoration: { type: 'boolean', defaultValue: true },
  },
})

type Props = { content: ContentProps<typeof HeroBlockContentType> }

export default function HeroBlock({ content: { title, showDecoration } }: Props) {
  return (
    <section data-epi-edit="title">
      <h1>{title}</h1>
    </section>
  )
}
```

**`baseType` values:**

- `_component` — reusable block placed inside pages
- `_page` — full page type
- `_experience` — Visual Builder experience
- `_section` — Visual Builder section (rows/columns)

**`data-epi-edit` attributes** enable in-context editing in the CMS preview — always add them to editable fields.

---

### 2. Registering All Components

`lib/optimizely/init.ts` is the **single entry point** that registers everything. It is imported once in `app/layout.tsx` (root layout) so it runs on every request.

```typescript
import { initContentTypeRegistry, initDisplayTemplateRegistry } from '@optimizely/cms-sdk'
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server'

// 1. Register schemas (for type resolution)
initContentTypeRegistry([HeroBlockContentType, CMSPageContentType, ...])

// 2. Register React components (maps content type key → component)
initReactComponentRegistry({
  resolver: { HeroBlock, CMSPage, ... },
})

// 3. Register display templates (optional variants of a component)
initDisplayTemplateRegistry([ProfileBlockDisplayTemplate])
```

**Rule: every new content type must be added to both `initContentTypeRegistry` and `initReactComponentRegistry`.**

---

### 3. Rendering Content Dynamically

`OptimizelyComponent` from `@optimizely/cms-sdk/react/server` resolves the correct React component based on the `__typename` or `_metadata.types` field in the content object. Never manually switch on content type — always use this.

```typescript
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

// Renders any content type — SDK resolves the component automatically
<OptimizelyComponent content={block} />

// Nesting — page renders its blocks
{content.blocks?.map((block, i) => (
  <OptimizelyComponent key={i} content={block} />
))}
```

---

### 4. Fetching Content with `'use cache'`

Page-level data fetching uses React 19's `'use cache'` directive with `cacheLife('max')` for long-lived static content.

```typescript
async function getPageContent(locale: string, slug: string[]) {
  'use cache'
  cacheLife('max')

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  return client.getContentByPath(`/${locale}/${slug.join('/')}/`)
}
```

**Critical rule for `'use cache'` functions:** Always handle errors **inside** the `'use cache'` function with a try/catch that returns `null` instead of throwing. If a `'use cache'` function throws, the error is re-thrown by the cache runtime in an async context outside the component's render — causing `HANGING_PROMISE_REJECTION` during static prerendering. The component-level try/catch cannot catch it.

```typescript
// CORRECT — error contained inside 'use cache'
async function getHeaderContent(locale: string) {
  'use cache'
  cacheLife('max')
  cacheTag(getCacheTag(CACHE_KEYS.HEADER, locale))

  try {
    const client = new GraphClient(...)
    const content = await client.getContentByPath(`/${locale}/header/`)
    return content[0] ?? null
  } catch {
    return null   // always resolve, never reject
  }
}

// WRONG — throws escape the 'use cache' context during prerender
async function getHeaderContent(locale: string) {
  'use cache'
  cacheLife('max')
  const content = await client.getContentByPath(...)  // unhandled rejection
  return content[0]
}
```

---

### 5. Cache Tags for Header and Footer

Header and Footer are shared across all pages and use cache tags for granular revalidation instead of path-based revalidation.

```typescript
// In the fetch function
cacheTag(getCacheTag(CACHE_KEYS.HEADER, locale))
// Results in tag: 'optimizely-header-en'

// In the webhook — invalidates only the header cache for that locale
revalidateTag(getCacheTag(CACHE_KEYS.HEADER, locale), 'max')
```

Cache key constants live in `lib/cache/cache-keys.ts`. Always use `getCacheTag(CACHE_KEYS.HEADER, locale)` — never hardcode tag strings.

---

### 6. Static Generation + Webhook ISR

```
next build
  └─ generateStaticParams() → getAllPagesPaths() → GraphQL query → all CMS page paths
  └─ All routes pre-rendered statically

CMS publishes content
  └─ POST /api/revalidate?cg_webhook_secret=...
  └─ revalidateTag() for header/footer
  └─ revalidatePath() for regular pages
  └─ Next.js re-renders affected routes on next request
```

`getAllPagesPaths()` fetches all `CMSPage` and `SEOExperience` pages. If the CMS is unreachable during build, it returns `[]` — the build succeeds and pages are rendered on demand (ISR fallback).

---

### 7. Middleware — Locale Routing (`proxy.ts`)

The middleware file is named `proxy.ts` but exports a `proxy` function and a `config` matcher — it acts as Next.js middleware. It handles locale routing with this priority:

```
1. Locale already in URL path (/en/about) → rewrite and set cookie
2. Cookie (__LOCALE_NAME)                 → use stored preference
3. Accept-Language header                 → negotiate with 'negotiator' package
4. Default locale (en)                   → fallback
```

- Default locale (`en`) → **rewrite** (URL stays without locale prefix)
- Non-default locale → **redirect** (URL gains locale prefix `/pl/...`)

Excluded paths: `/api/`, `/preview`, static assets, files with extensions.

---

### 8. Revalidation Webhook (`/api/revalidate`)

Receives a POST from Optimizely CMS when content is published. Validates a shared secret, resolves the published content's URL, and revalidates.

```typescript
// Authentication — shared secret in query param
?cg_webhook_secret=<OPTIMIZELY_REVALIDATE_SECRET>

// Payload — docId identifies the published content
{ data: { docId: "<guid>_<locale>_Published" } }
```

URL resolution handles two URL types from Optimizely:

- `SIMPLE` — uses `_metadata.url.default` directly
- `hierarchical` — uses `_metadata.url.hierarchical`, strips `OPTIMIZELY_START_PAGE_URL` prefix

Header/Footer pages → `revalidateTag(tag, 'max')`
All other pages → `revalidatePath(url)`

---

### 9. Visual Builder Support

Experiences and sections use `OptimizelyComposition` and `OptimizelyGridSection` for Visual Builder layout rendering.

```typescript
// experience/BlankExperience.tsx
import { OptimizelyComposition, getPreviewUtils } from '@optimizely/cms-sdk/react/server'

function ComponentWrapper({ children, node }: ComponentContainerProps) {
  const { pa } = getPreviewUtils(node)   // preview attributes for in-context editing
  return <div {...pa(node)}>{children}</div>
}

export default function BlankExperience({ content }: Props) {
  return (
    <OptimizelyComposition
      nodes={content.composition.nodes ?? []}
      ComponentWrapper={ComponentWrapper}
    />
  )
}
```

```typescript
// section/BlankSection.tsx — row/column grid
import { OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'

// Classes prefixed with 'vb:' are used by the Visual Builder UI
<div className="vb:row flex flex-1 flex-col md:flex-row" {...pa(node)}>
```

`getPreviewUtils(node).pa(node)` injects preview mode attributes. Always spread `{...pa(node)}` on wrapper elements in experiences and sections.

---

### 10. Preview Mode (`/preview`)

Renders unpublished draft content. Receives CMS preview parameters via search params and injects the Optimizely communication script for in-context editing.

```typescript
// app/preview/page.tsx
<Script src={`${process.env.OPTIMIZELY_CMS_HOST}/util/javascript/communicationinjector.js`} />
<OptimizelyComponent content={response} />
```

Preview route is excluded from middleware locale routing (`shouldExclude` checks for `/preview`).

---

## Environment Variables

| Variable                       | Required  | Description                                                                                                                     |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `OPTIMIZELY_GRAPH_SINGLE_KEY`  | Yes       | API key for Optimizely Content Graph                                                                                            |
| `OPTIMIZELY_CMS_CLIENT_ID`     | Yes (CLI) | Client ID for `@optimizely/cms-cli` authentication                                                                              |
| `OPTIMIZELY_CMS_CLIENT_SECRET` | Yes (CLI) | Client Secret for `@optimizely/cms-cli` authentication                                                                          |
| `OPTIMIZELY_CMS_HOST`          | Yes       | Root URL of CMS instance, e.g. `https://app-xyz.cms.optimizely.com`                                                             |
| `OPTIMIZELY_GRAPH_URL`         | Yes       | Content Graph base URL — `https://cg.optimizely.com/content/v2`                                                                 |
| `OPTIMIZELY_REVALIDATE_SECRET` | Yes       | Shared secret for webhook authentication                                                                                        |
| `OPTIMIZELY_START_PAGE_URL`    | Yes       | CMS route URL of the Start Page (e.g. `/start-page`) — used to strip the prefix when resolving hierarchical URLs in the webhook |

---

## Adding a New Block — Step by Step

1. **Create the component** in `components/optimizely/block/my-block.tsx`:

   ```typescript
   import { contentType, ContentProps } from '@optimizely/cms-sdk'

   export const MyBlockContentType = contentType({
     key: 'MyBlock',
     displayName: 'My Block',
     baseType: '_component',
     properties: {
       heading: { type: 'string', localized: true },
     },
   })

   type Props = { content: ContentProps<typeof MyBlockContentType> }

   export default function MyBlock({ content: { heading } }: Props) {
     return <div data-epi-edit="heading">{heading}</div>
   }
   ```

2. **Register** in `lib/optimizely/init.ts`:

   ```typescript
   initContentTypeRegistry([..., MyBlockContentType])
   initReactComponentRegistry({ resolver: { ..., MyBlock } })
   ```

3. **Allow in pages** — add `MyBlockContentType` to `AllBlocksContentTypes` in `lib/optimizely/content-types.ts` if it should be placeable inside CMS pages.

4. **Push to CMS**:

   ```bash
   npm run opti-push
   ```

5. The block is now available in the Optimizely CMS editor.

---

## Supported Locales

Configured in `lib/optimizely/language.ts`. To add a new locale:

1. Add to `LOCALES` array
2. Add the language in your Optimizely CMS instance settings
3. Add a label in `components/layout/language-switcher.tsx` (`LOCALE_NAMES` map)

```typescript
export const DEFAULT_LOCALE = 'en'
export const LOCALES = ['en', 'pl', 'sv']
```

---

## Known Gotchas

- **`proxy.ts` is the middleware** — Next.js requires the middleware to be at `middleware.ts` in the root, but the file here is `proxy.ts`. Ensure it is properly wired as the Next.js middleware entry point.

- **`'use cache'` must never throw** — see pattern #4 above. Always wrap the fetch logic inside `'use cache'` in try/catch and return `null` on error.

- **`as any` in GraphQL requests** — the SDK's `client.request()` types are incomplete in some cases. This is a known SDK limitation and is tracked with `// Todo: Workaround for types for now` comments.

- **`OPTIMIZELY_START_PAGE_URL`** — Optimizely does not assign `/` as the URL of the Start Page when using hierarchical routing. The Start Page gets a real path like `/start-page`. This env var is used to strip that prefix when resolving URLs in the webhook, making the routes appear at the root.

- **Display templates** — used for component variants (e.g. `ProfileBlock` has a display template for a different visual style). Register via `initDisplayTemplateRegistry`.
