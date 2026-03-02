import { AllBlocksContentTypes } from '../../../lib/optimizely/content-types'
import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export const StartPageContentType = contentType({
  key: 'StartPage',
  displayName: 'Start Page',
  baseType: '_page',
  properties: {
    title: {
      type: 'string',
      displayName: 'Title',
      localized: true,
      sortOrder: 10,
    },
    shortDescription: {
      type: 'string',
      displayName: 'Short Description',
      localized: true,
      sortOrder: 20,
    },
    keywords: {
      type: 'string',
      displayName: 'Keywords',
      localized: true,
      sortOrder: 30,
    },
    blocks: {
      type: 'array',
      localized: true,
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
  content: ContentProps<typeof StartPageContentType>
}

export default function StartPage({ content }: Props) {
  return (
    <main>
      {content.blocks?.map((section, i) => (
        <OptimizelyComponent key={i} content={section} />
      ))}
    </main>
  )
}
