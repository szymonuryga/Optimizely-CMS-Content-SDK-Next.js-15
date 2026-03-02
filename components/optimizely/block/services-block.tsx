import type React from 'react' // Import React
import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { ServiceItemContentType } from './service-item'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export const ServicesBlockContentType = contentType({
  key: 'ServicesBlock',
  displayName: 'Services Block',
  baseType: '_component',
  properties: {
    services: {
      type: 'array',
      items: {
        type: 'content',
        allowedTypes: [ServiceItemContentType],
      },
      displayName: 'Services',
      localized: true,
      sortOrder: 10,
    },
  },
})

type Props = {
  content: ContentProps<typeof ServicesBlockContentType>
}

export default function ServicesBlock({ content }: Props) {
  const { services } = content
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid gap-8 md:grid-cols-3">
        {services?.map((item, index) => (
          <OptimizelyComponent key={index} content={item} />
        ))}
      </div>
    </section>
  )
}
