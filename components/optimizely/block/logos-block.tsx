import { contentType, ContentProps } from '@optimizely/cms-sdk'
import { LogoItemBlockContentType } from './logo-item-block'
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'

export const LogosBlockContentType = contentType({
  key: 'LogosBlock',
  displayName: 'Logos Block',
  baseType: '_component',
  properties: {
    logos: {
      type: 'array',
      items: {
        type: 'content',
        allowedTypes: [LogoItemBlockContentType],
      },
      displayName: 'Logos',
    },
  },
})

type Props = {
  content: ContentProps<typeof LogosBlockContentType>
}

export default function LogosBlock({ content: { logos } }: Props) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div
        className="flex flex-wrap justify-center gap-12"
        data-epi-edit="logos"
      >
        {logos?.map((logo, index) => (
          <OptimizelyComponent key={index} content={logo} />
        ))}
      </div>
    </section>
  )
}
