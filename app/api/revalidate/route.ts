import { GraphClient } from '@optimizely/cms-sdk'
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { CACHE_KEYS, getCacheTag } from '@/lib/cache/cache-keys'

const OPTIMIZELY_REVALIDATE_SECRET = process.env.OPTIMIZELY_REVALIDATE_SECRET

export async function POST(request: NextRequest) {
  try {
    validateWebhookSecret(request)
    const docId = await extractDocId(request)

    if (!docId || !docId.includes('Published')) {
      return NextResponse.json({ message: 'No action taken' })
    }

    const [guid, locale] = docId.split('_')
    const formattedGuid = guid.replaceAll('-', '')

    const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
      graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
    })

    const contentData = await client.request(GET_CONTENT_BY_GUID_QUERY, {
      guid: formattedGuid,
      locale: [locale],
      // Todo: Workaround for types for now
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    const content = contentData?._Content?.item
    const urlType = content?._metadata?.url?.type
    // In hierarchical routing, the Start Page in Optimizely does not use "/" as its URL.
    // Instead, it has a custom path like "/start-page". We remove the OPTIMIZELY_START_PAGE_URL
    // prefix to normalize the URL and make it relative to the site root.
    const url =
      urlType === 'SIMPLE'
        ? content?._metadata?.url?.default
        : content?._metadata?.url?.hierarchical?.replace(
            process.env.OPTIMIZELY_START_PAGE_URL ?? '',
            ''
          )

    if (!url) {
      return NextResponse.json({ message: 'Page Not Found' }, { status: 400 })
    }

    const urlWithLocale = normalizeUrl(url, locale)

    await handleRevalidation(urlWithLocale, locale)

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    return handleError(error)
  }
}

// Define the GraphQL query string
const GET_CONTENT_BY_GUID_QUERY = `
  query GetContentByGuid($guid: String, $locale: [Locales]) {
    _Content(locale: $locale, where: { _metadata: { key: { eq: $guid } } }) {
      item {
        _metadata {
          displayName
          url {
            hierarchical
            default
            type
          }
        }
      }
    }
  }
`

function validateWebhookSecret(request: NextRequest) {
  const webhookSecret = request.nextUrl.searchParams.get('cg_webhook_secret')
  if (webhookSecret !== OPTIMIZELY_REVALIDATE_SECRET) {
    throw new Error('Invalid credentials')
  }
}

async function extractDocId(request: NextRequest): Promise<string> {
  const requestJson = await request.json()
  return requestJson?.data?.docId || ''
}

function normalizeUrl(url: string, locale: string): string {
  // Ensure the URL starts with a slash
  let normalizedUrl = url.startsWith('/') ? url : `/${url}`

  // Remove the trailing slash, if present (e.g. "/about/" -> "/about")
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1)
  }

  // If the URL doesn't already start with the locale (e.g. "/en"), prepend it
  return normalizedUrl.startsWith(`/${locale}`)
    ? normalizedUrl
    : `/${locale}${normalizedUrl}`
}

async function handleRevalidation(urlWithLocale: string, locale: string) {
  if (urlWithLocale.includes('footer')) {
    const footerTag = getCacheTag(CACHE_KEYS.FOOTER, locale)
    console.log(`Revalidating tag: ${footerTag}`)
    revalidateTag(footerTag, 'max')
  } else if (urlWithLocale.includes('header')) {
    const headerTag = getCacheTag(CACHE_KEYS.HEADER, locale)
    console.log(`Revalidating tag: ${headerTag}`)
    revalidateTag(headerTag, 'max')
  } else {
    console.log(`Revalidating path: ${urlWithLocale}`)
    revalidatePath(urlWithLocale)
  }
}

function handleError(error: unknown) {
  console.error('Error processing webhook:', error)
  if (error instanceof Error) {
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
  return NextResponse.json(
    { message: 'Internal Server Error' },
    { status: 500 }
  )
}
