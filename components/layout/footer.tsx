import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { GraphClient } from '@optimizely/cms-sdk'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_KEYS, getCacheTag } from '@/lib/cache/cache-keys'

async function getFooterContent(locale: string) {
  'use cache'
  cacheLife('max')
  cacheTag(getCacheTag(CACHE_KEYS.FOOTER, locale))

  try {
    const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
      graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
    })
    const content = await client.getContentByPath(`/${locale}/footer/`)
    return content[0] ?? null
  } catch {
    return null
  }
}

export async function Footer({ locale }: { locale: string }) {
  const content = await getFooterContent(locale)

  if (!content) return null

  return <OptimizelyComponent content={content} />
}
