import { generateAlternates } from '@/lib/metadata'
import { getAllPagesPaths } from '@/lib/optimizely/all-pages'
import { GraphClient } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{
    slug: string[]
    locale: string
  }>
}

export async function generateStaticParams() {
  try {
    return await getAllPagesPaths()
  } catch (e) {
    console.error('Error generating static params:', e)
    return [] // Return an empty array on error to prevent build failures
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  const formattedSlug = `/${slug.join('/')}/`

  const contentResult = await client.getContentByPath(`/${locale}${formattedSlug}`)
  const c = contentResult[0]

  return {
    title: c?.title ?? '',
    description: c?.shortDescription || '',
    keywords: c?.keywords ?? '',
    alternates: generateAlternates(locale, formattedSlug),
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  try {
    const c = await client.getContentByPath(`/${locale}/${slug.join('/')}/`)

  return <OptimizelyComponent content={c[0]} />;
  } catch (error) {
    console.error('Error fetching content:', error)
    return notFound()
  }
}
