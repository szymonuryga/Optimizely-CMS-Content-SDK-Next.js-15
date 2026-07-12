import { getClient, type PreviewParams } from '@optimizely/cms-sdk'
import {
  OptimizelyComponent,
  withAppContext,
} from '@optimizely/cms-sdk/react/server'
import { NextPreviewComponent } from '@optimizely/cms-sdk/react/nextjs'
import Script from 'next/script'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function Page({ searchParams }: Props) {
  const client = getClient()

  const response = await client.getPreviewContent(
    // TODO: check types in runtime properly
    (await searchParams) as PreviewParams
  )

  if (!response) {
    return <div>No content found for the given parameters.</div>
  }

  return (
    <>
      <Script
        src={`${process.env.OPTIMIZELY_CMS_HOST}/util/javascript/communicationinjector.js`}
      ></Script>
      <NextPreviewComponent />
      <Suspense fallback={<div>Loading...</div>}>
        <OptimizelyComponent content={response} />
      </Suspense>
    </>
  )
}

export default withAppContext(Page)
