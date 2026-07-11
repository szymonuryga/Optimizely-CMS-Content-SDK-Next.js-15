import { contentType, ContentProps } from '@optimizely/cms-sdk'
import {
  ComponentContainerProps,
  OptimizelyComposition,
  getPreviewUtils,
} from '@optimizely/cms-sdk/react/server'

export const SEOExperienceContentType = contentType({
  key: 'SEOExperience',
  displayName: 'SEO Experience',
  baseType: '_experience',
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
  },
})

type Props = {
  content: ContentProps<typeof SEOExperienceContentType>
}

function ComponentWrapper({ children, node }: ComponentContainerProps) {
  const { pa } = getPreviewUtils(node)
  return <div {...pa(node)}>{children}</div>
}

export default function SEOExperience({ content }: Props) {
  return (
    <main>
      <OptimizelyComposition
        nodes={content.composition.nodes ?? []}
        ComponentWrapper={ComponentWrapper}
      />
    </main>
  )
}
