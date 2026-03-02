import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { GraphClient } from '@optimizely/cms-sdk'

export async function Header({ locale }: { locale: string }) {
  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  console.log('Fetching header content for locale:', locale)
  try {
    const c = await client.getContentByPath(`/${locale}/header/`)

    const OptimizelyComponentWithLocale =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      OptimizelyComponent as React.ComponentType<{ content: any; locale: string }>
    return <OptimizelyComponentWithLocale content={c[0]} locale={locale} />
  } catch (error) {
    console.error('Error fetching content:', error)
    return null
  }
}
