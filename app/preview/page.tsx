import { GraphClient, type PreviewParams } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import Script from 'next/script'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: Props) {
  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY!, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_URL,
  })

  const response = await client.getPreviewContent(
    // TODO: check types in runtime properly
    (await searchParams) as PreviewParams
  )

  console.log('Preview response:', response)

  if (!response) {
    return <div>No content found for the given parameters.</div>
  }

  return (
    <>
      <Script
        src={`${process.env.OPTIMIZELY_CMS_HOST}/util/javascript/communicationinjector.js`}
      ></Script>
      <PreviewComponent />
      <Suspense fallback={<div>Loading...</div>}>
        <OptimizelyComponent content={response} />
      </Suspense>
    </>
  )
}
