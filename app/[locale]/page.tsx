import { generateAlternates } from '@/lib/metadata'
import { GraphClient } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { cacheLife } from 'next/cache'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    locale: string
  }>
}

async function getHomepageContent(locale: string) {
  'use cache'
  cacheLife('max')

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  return client.getContentByPath(`/${locale}/`)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  const contentResult = await getHomepageContent(locale)
  const c = contentResult[0]

  return {
    title: c?.title ?? '',
    description: c?.shortDescription || '',
    keywords: c?.keywords ?? '',
    alternates: generateAlternates(locale, '/'),
  }
}

export default async function Page({ params }: Props) {
  const { locale } = await params

  try {
    const c = await getHomepageContent(locale)
    return <OptimizelyComponent content={c[0]} />
  } catch (error) {
    console.error('Error fetching content:', error)
    return notFound()
  }
}
