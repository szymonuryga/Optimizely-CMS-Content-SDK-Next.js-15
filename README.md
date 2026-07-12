# Optimizely CMS SDK + Next.js — Starter Template

A starter template for building modern websites with **Optimizely CMS SDK** (`@optimizely/cms-sdk`) and **Next.js App Router**. This repository is designed to serve as a practical starting point for developers learning how to integrate Optimizely SaaS CMS using the official SDK and CLI — and as a foundation for a step-by-step course.

> **Note:** This template requires an Optimizely SaaS CMS instance to retrieve content. Please connect with the [Optimizely](https://www.optimizely.com/products/content-management/) team to receive CMS access.

---

## What is this?

This project demonstrates how to use:

- **[`@optimizely/cms-sdk`](https://www.npmjs.com/package/@optimizely/cms-sdk)** — the official Optimizely CMS Content SDK for fetching, typing, and rendering CMS content in a type-safe way
- **[`@optimizely/cms-cli`](https://www.npmjs.com/package/@optimizely/cms-cli)** — the official CLI tool for pushing content type definitions from code to your Optimizely CMS instance (`config push`)

It covers the core patterns you need for any Optimizely CMS project:

- Defining content types in code and pushing them via CLI
- Fetching content with the SDK's GraphQL client
- Rendering content dynamically with `OptimizelyComponent`
- Cache revalidation via CMS webhooks
- Multi-language routing and locale detection
- Preview / in-context editing support
- SEO metadata generation

---

## Features

- ⚡ **Next.js 16** with App Router
- 🧩 **`@optimizely/cms-sdk`** — content types, GraphQL client, React component registry
- 🛠️ **`@optimizely/cms-cli`** — push content type definitions to CMS from code
- 🏗️ **Static Site Generation** with `generateStaticParams()` for all CMS pages
- 🔄 **On-Demand Cache Revalidation** via webhooks (`revalidatePath` / `revalidateTag`)
- 👁️ **Preview Mode** for in-context editing in Optimizely CMS
- 🌐 **Multi-language Support** with automatic Accept-Language detection (en / pl / sv)
- 🎨 **Tailwind CSS v4** & **shadcn/ui** components
- 📊 **TypeScript** with strict mode
- 🔍 **SEO Optimized** — metadata + hreflang alternates per locale

---

## Project Structure

```
app/
  [locale]/
    layout.tsx          # Locale-aware root layout (Header, Footer, fonts)
    page.tsx            # Homepage — fetches Start Page content
    [...slug]/page.tsx  # Dynamic catch-all route for all CMS pages
  api/revalidate/       # Webhook endpoint — triggers cache revalidation
  preview/              # Preview mode for CMS in-context editing

components/
  optimizely/
    block/              # Block components (HeroBlock, ProfileBlock, etc.)
    page/               # Page type components (CMSPage, HeaderPage, FooterPage)
    experience/         # Experience types (BlankExperience, SEOExperience)
    section/            # Section types (BlankSection)
  layout/               # Header, Footer, LanguageSwitcher
  ui/                   # shadcn/ui components (Button, Card, Avatar, etc.)

lib/
  optimizely/
    init.ts             # Registers all content types and React components
    all-pages.ts        # Fetches all page paths for generateStaticParams()
    content-types.ts    # Allowed block types list
    language.ts         # Locale configuration
  cache/                # Cache key constants and helpers
  image/                # Custom Cloudinary image loader
  metadata.ts           # SEO metadata and hreflang helpers
  utils.ts              # URL and className utilities

proxy.ts                # Next.js middleware — locale routing and negotiation
optimizely.config.mjs   # Optimizely CLI config (points to component files)
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- An Optimizely SaaS CMS instance
- Optimizely Content Graph API key
- Client ID and Secret from your CMS instance (for CLI)

### 1. Clone the repository

```bash
git clone https://github.com/szymonuryga/Optimizely-CMS-Content-SDK-Next.js-16.git
cd Optimizely-CMS-Content-SDK-Next.js-16
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```plaintext
# Key to fetch content from the CMS.
# Go to your CMS instance > Settings > API Keys
OPTIMIZELY_GRAPH_SINGLE_KEY="<YOUR_SINGLE_KEY>"

# Client ID and Secret — used by the CLI to push content types
# Go to your CMS instance > Settings > API Keys > Create API key
OPTIMIZELY_CMS_CLIENT_ID=""
OPTIMIZELY_CMS_CLIENT_SECRET=""

# Root URL of your CMS instance
OPTIMIZELY_CMS_HOST="https://<your-instance>.cms.optimizely.com"

# Optimizely Content Graph base URL
OPTIMIZELY_GRAPH_URL="https://cg.optimizely.com/content/v2"

# A secret key used to authenticate cache revalidation webhook calls
OPTIMIZELY_REVALIDATE_SECRET=""

# The route URL of the Start Page in CMS (e.g. "/start-page")
OPTIMIZELY_START_PAGE_URL=""
```

### 4. Push content types to CMS

Use the Optimizely CLI to push all content type definitions (blocks, pages, experiences) from code to your CMS instance:

```bash
npm run opti-push
```

> If you need to overwrite existing definitions (data loss warning):
>
> ```bash
> npm run opti-push-data-loss
> ```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How the SDK is Used

### Defining a content type

Content types are defined in code using `contentType()` from `@optimizely/cms-sdk`. This generates TypeScript types and schema that the CLI pushes to your CMS:

```typescript
import { contentType } from '@optimizely/cms-sdk'

export const HeroBlockContentType = contentType({
  key: 'HeroBlock',
  displayName: 'Hero Block',
  baseType: '_component',
  properties: {
    title: { type: 'string', displayName: 'Title', isLocalized: true },
    subtitle: { type: 'string', displayName: 'Subtitle', isLocalized: true },
    showDecoration: { type: 'boolean', },
  },
})
```

### Registering components

All content types and their React components are registered in [`lib/optimizely/init.ts`](lib/optimizely/init.ts):

```typescript
import { initContentTypeRegistry } from '@optimizely/cms-sdk'
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server'

initContentTypeRegistry([HeroBlockContentType, CMSPageContentType, ...])

initReactComponentRegistry({
  resolver: { HeroBlock, CMSPage, ... },
})
```

### Rendering content

`OptimizelyComponent` automatically resolves the correct React component based on the content type returned by the API:

```typescript
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export default function CMSPage({ content }) {
  return (
    <main>
      {content.blocks?.map((block, i) => (
        <OptimizelyComponent key={i} content={block} />
      ))}
    </main>
  )
}
```

### Fetching content

The Graph client is configured once — via `config({ apiKey, graphUrl })` in [`lib/optimizely/init.ts`](lib/optimizely/init.ts) — then retrieved anywhere with `getClient()`, with built-in methods and React 19 cache support:

```typescript
import { getClient } from '@optimizely/cms-sdk'

async function getPageContent(locale: string, slug: string[]) {
  'use cache'
  cacheLife('max')

  const client = getClient()

  return client.getContentByPath(`/${locale}/${slug.join('/')}/`)
}
```

### Pushing content types with the CLI

The [`optimizely.config.mjs`](optimizely.config.mjs) file tells the CLI where to find your component files:

```javascript
import { buildConfig } from '@optimizely/cms-sdk'

export default buildConfig({
  components: ['./components/optimizely/**/*.tsx'],
})
```

Run `npm run opti-push` to sync all content type definitions to your CMS instance.

---

## Cache Revalidation

The `/api/revalidate` endpoint receives webhook calls from Optimizely CMS when content is published. It validates a shared secret and calls `revalidatePath()` or `revalidateTag()` to purge the Next.js cache:

```
POST /api/revalidate?cg_webhook_secret=<YOUR_SECRET>
```

Header and Footer use cache tags for granular invalidation:

```typescript
// In component — tag the cache
cacheTag(getCacheTag(CACHE_KEYS.HEADER, locale))

// In webhook — invalidate by tag
revalidateTag(getCacheTag(CACHE_KEYS.HEADER, locale), 'max')
```

---

## Multi-language Support

Supported locales are configured in [`lib/optimizely/language.ts`](lib/optimizely/language.ts):

```typescript
export const DEFAULT_LOCALE = 'en'
export const LOCALES = ['en', 'pl', 'sv']
```

The middleware ([`proxy.ts`](proxy.ts)) handles locale detection with the following priority:

1. Locale in the URL path
2. Cookie (`__LOCALE_NAME`)
3. `Accept-Language` browser header
4. Default locale (`en`)

---

## Preview Mode

The `/preview` route renders unpublished content from Optimizely CMS. It injects the Optimizely communication script that enables in-context editing, and uses `NextPreviewComponent` for router-integrated refresh on save:

```typescript
<Script src={`${process.env.OPTIMIZELY_CMS_HOST}/util/javascript/communicationinjector.js`} />
<NextPreviewComponent />
<OptimizelyComponent content={response} />
```

---

## AI-Assisted Development with Agent Skills

This starter ships with the official Optimizely CMS **Agent Skills**, vendored into [`.claude/skills/`](.claude/skills/). [Agent Skills](https://agentskills.io) are a standardized, open format for packaging domain expertise into a folder an AI coding agent can load *on demand*: every skill's `name` and `description` sit in the agent's context at all times (a few hundred tokens), but the full instructions only load once a task actually matches — so keeping several installed costs next to nothing until they're used. The format is supported by [40+ agentic tools](https://agentskills.io/clients), including Claude Code, Cursor, GitHub Copilot, and VS Code — not just Claude.

### Bundled skills

| Skill                                                                    | Use it to...                                                           | Example prompt                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| [`optimizely-setup`](.claude/skills/optimizely-setup/SKILL.md)           | Bootstrap the SDK/CLI in a project from scratch                        | "Set up Optimizely SDK in this project"                 |
| [`optimizely-model`](.claude/skills/optimizely-model/SKILL.md)           | Define content types, display templates, and contracts in code         | "Create a BlogPage content type with title and body"    |
| [`optimizely-model-react`](.claude/skills/optimizely-model-react/SKILL.md) | Generate the React component for a content type or display template | "Create the React component for BlogPage"                |
| [`optimizely-preview`](.claude/skills/optimizely-preview/SKILL.md)       | Set up, configure, or debug live preview / click-to-edit               | "Set up live preview for Next.js App Router"             |

Each skill folder also has a `references/` subfolder with deeper material (property types, base types, common pitfalls, troubleshooting) that the agent reads only when a task actually needs that level of detail, keeping everyday prompts cheap.

### Using them

Nothing to configure — an Agent Skills-compatible tool (Claude Code, Cursor, etc.) picks up everything in `.claude/skills/` automatically for this repo. Just describe what you want (see the example prompts above) and the matching skill activates; combine them for larger tasks, e.g. `optimizely-model` → `optimizely-model-react` → `optimizely-preview` to go from "model a new block" to "it's editable in live preview."

### Keeping them up to date

These skills are mirrored from the SDK's own repository and aren't maintained here. To refresh a skill, pull the latest version of its folder from [`episerver/content-js-sdk`](https://github.com/episerver/content-js-sdk/tree/main/plugins/optimizely-cms-skills/skills) (`plugins/optimizely-cms-skills/skills/<skill-name>`) and replace the matching folder under `.claude/skills/`.

If you'd rather not vendor the files, Claude Code can install and auto-update them as a plugin instead:

```
/plugin marketplace add episerver/content-js-sdk
/plugin install optimizely-cms-skills@episerver-content-js-sdk
```

---

## Available Scripts

| Script                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `npm run dev`                 | Start development server (with Node inspector) |
| `npm run dev-https`           | Start development server with HTTPS            |
| `npm run build`               | Build for production                           |
| `npm run start`               | Start production server                        |
| `npm run format`              | Format code with Prettier                      |
| `npm run opti-push`           | Push content types to Optimizely CMS           |
| `npm run opti-push-data-loss` | Push content types (force, allows data loss)   |

---

## Environment Variables Reference

| Variable                       | Required  | Description                                             |
| ------------------------------ | --------- | ------------------------------------------------------- |
| `OPTIMIZELY_GRAPH_SINGLE_KEY`  | Yes       | API key for fetching content from Optimizely Graph      |
| `OPTIMIZELY_CMS_CLIENT_ID`     | Yes (CLI) | Client ID for authenticating the Optimizely CLI         |
| `OPTIMIZELY_CMS_CLIENT_SECRET` | Yes (CLI) | Client Secret for authenticating the Optimizely CLI     |
| `OPTIMIZELY_CMS_HOST`          | Yes       | Root URL of your CMS instance                           |
| `OPTIMIZELY_GRAPH_URL`         | Yes       | Optimizely Content Graph base URL                       |
| `OPTIMIZELY_REVALIDATE_SECRET` | Yes       | Shared secret for webhook-based cache revalidation      |
| `OPTIMIZELY_START_PAGE_URL`    | Yes       | Route URL of the Start Page in CMS (e.g. `/start-page`) |

---

## Tech Stack

| Technology            | Version |
| --------------------- | ------- |
| Next.js               | 16      |
| React                 | 19      |
| `@optimizely/cms-sdk` | ^2.1.0  |
| `@optimizely/cms-cli` | ^2.1.0  |
| Tailwind CSS          | ^4      |
| TypeScript            | ^5      |
| shadcn/ui             | —       |
| Radix UI              | —       |

---

## License

[MIT](LICENSE)
