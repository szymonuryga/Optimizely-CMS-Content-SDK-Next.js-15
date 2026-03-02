import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { NavItemContentType } from './nav-item'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export const FooterColumnContentType = contentType({
  key: 'FooterColumn',
  displayName: 'Footer Column',
  baseType: '_component',
  properties: {
    title: {
      type: 'string',
      displayName: 'Title',
      localized: true,
    },
    links: {
      type: 'array',
      displayName: 'Links',
      items: {
        type: 'content',
        allowedTypes: [NavItemContentType],
      },
      sortOrder: 10,
    },
  },
})

type Props = {
  content: ContentProps<typeof FooterColumnContentType>
}

export default function FooterColumn({ content }: Props) {
  const { title, links } = content
  return (
    <div>
      <h3 className="mb-4 font-bold">{title}</h3>
      <nav className="grid gap-2">
        {links?.map((item, index) => (
          <OptimizelyComponent key={index} content={item} />
        ))}
      </nav>
    </div>
  )
}
