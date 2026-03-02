import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { GraphClient } from '@optimizely/cms-sdk'

export async function Footer({ locale }: { locale: string }) {
  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  try {
    const c = await client.getContentByPath(`/${locale}/footer/`)

    return <OptimizelyComponent content={c[0]} />
  } catch (error) {
    console.error('Error fetching content:', error)
    return null
  }
}
