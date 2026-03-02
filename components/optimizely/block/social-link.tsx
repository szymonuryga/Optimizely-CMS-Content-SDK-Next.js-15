import Link from 'next/link'
import { Icons } from '../../../components/ui/icons'
import { contentType, ContentProps } from '@optimizely/cms-sdk'

export const SocialLinkContentType = contentType({
  key: 'SocialLink',
  displayName: 'Social Link',
  baseType: '_component',
  properties: {
    href: {
      type: 'string',
      displayName: 'Href',
    },
    platform: {
      type: 'string',
      format: 'selectOne',
      enum: [
        {
          displayName: 'Twitter',
          value: 'twitter',
        },
        {
          displayName: 'Instagram',
          value: 'instagram',
        },
        {
          displayName: 'LinkedIn',
          value: 'linkedin',
        },
        {
          displayName: 'GitHub',
          value: 'github',
        },
      ],
      group: 'Information',
      displayName: 'Platform',
    },
  },
})

type Props = {
  content: ContentProps<typeof SocialLinkContentType>
}

export function SocialLink({ content }: Props) {
  const { href, platform } = content
  const formatPlatform = (platform ?? '') as keyof typeof Icons

  const Icon = platform ? Icons?.[formatPlatform] : null
  return (
    <Link
      href={href ?? '/'}
      className="text-muted-foreground hover:text-foreground"
    >
      {Icon && <Icon className="h-5 w-5" />}
    </Link>
  )
}
