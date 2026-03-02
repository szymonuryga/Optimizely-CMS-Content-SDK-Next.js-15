import { generateAlternates } from '@/lib/metadata'
import { GraphClient } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  const contentResult = await client.getContentByPath(`/${locale}/`)
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

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  try {
    const c = await client.getContentByPath(`/${locale}/`)

    return <OptimizelyComponent content={c[0]} />;
  } catch (error) {
    console.error('Error fetching content:', error)
    return notFound()
  }
}
