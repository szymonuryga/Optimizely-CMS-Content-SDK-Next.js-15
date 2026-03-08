import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { GraphClient } from '@optimizely/cms-sdk'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_KEYS, getCacheTag } from '@/lib/cache/cache-keys'

async function getHeaderContent(locale: string) {
  'use cache'
  cacheLife('max')
  cacheTag(getCacheTag(CACHE_KEYS.HEADER, locale))

  try {
    const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
      graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
    })
    const content = await client.getContentByPath(`/${locale}/header/`)
    return content[0] ?? null
  } catch {
    return null
  }
}

export async function Header({ locale }: { locale: string }) {
  const content = await getHeaderContent(locale)

  if (!content) return null

  const OptimizelyComponentWithLocale =
    OptimizelyComponent as React.ComponentType<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: any
      locale: string
    }>
  return <OptimizelyComponentWithLocale content={content} locale={locale} />
}
