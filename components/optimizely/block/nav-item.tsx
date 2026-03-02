import { contentType, ContentProps } from '@optimizely/cms-sdk'
import Link from 'next/link'

export const NavItemContentType = contentType({
  key: 'NavItem',
  displayName: 'Nav Item',
  baseType: '_component',
  properties: {
    href: {
      type: 'string',
      displayName: 'Href',
    },
    label: {
      type: 'string',
      displayName: 'Label',
      localized: true,
    },
  },
})

type Props = {
  content: ContentProps<typeof NavItemContentType>
}

export default function NavItem({ content }: Props) {
  const { href, label } = content
  return (
    <Link href={href ?? '/'} className="text-sm">
      {label}
    </Link>
  )
}
