import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { FooterColumnContentType } from '../block/footer-column'
import { SocialLinkContentType } from '../block/social-link'

export const FooterContentType = contentType({
  key: 'Footer',
  displayName: 'Footer',
  baseType: '_page',
  properties: {
    copyrightText: {
      type: 'string',
      displayName: 'Copyright Text',
      sortOrder: 10,
    },
    columns: {
      type: 'array',
      displayName: 'Columns',
      localized: true,
      sortOrder: 20,
      items: {
        type: 'content',
        allowedTypes: [FooterColumnContentType],
      },
    },
    socialLinks: {
      type: 'array',
      localized: true,
      displayName: 'Social Links',
      sortOrder: 30,
      items: {
        type: 'content',
        allowedTypes: [SocialLinkContentType],
      },
    },
  },
})

type Props = {
  content: ContentProps<typeof FooterContentType>
}

export default function Footer({
  content: { copyrightText, columns, socialLinks },
}: Props) {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {columns?.map((item, index) => (
            <OptimizelyComponent key={index} content={item} />
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-4">
          {socialLinks?.map((item, index) => (
            <OptimizelyComponent key={index} content={item} />
          ))}
        </div>
        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          {copyrightText}
        </div>
      </div>
    </footer>
  )
}
