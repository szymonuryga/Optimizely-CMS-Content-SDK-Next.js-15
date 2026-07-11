import { AllBlocksContentTypes } from '../../../lib/optimizely/content-types'
import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export const CMSPageContentType = contentType({
  key: 'CMSPage',
  displayName: 'CMS Page',
  baseType: '_page',
  properties: {
    title: {
      type: 'string',
      displayName: 'Title',
      isLocalized: true,
      sortOrder: 10,
    },
    shortDescription: {
      type: 'string',
      displayName: 'Short Description',
      isLocalized: true,
      sortOrder: 20,
    },
    keywords: {
      type: 'string',
      displayName: 'Keywords',
      isLocalized: true,
      sortOrder: 30,
    },
    blocks: {
      type: 'array',
      isLocalized: true,
      displayName: 'Blocks',
      sortOrder: 40,
      items: {
        type: 'content',
        allowedTypes: AllBlocksContentTypes,
      },
    },
  },
})

type Props = {
  content: ContentProps<typeof CMSPageContentType>
}

export default function CMSPage({ content }: Props) {
  return (
    <main>
      {content.blocks?.map((section, i) => (
        <OptimizelyComponent key={i} content={section} />
      ))}
    </main>
  )
}
