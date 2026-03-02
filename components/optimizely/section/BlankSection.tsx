import { BlankSectionContentType, ContentProps } from '@optimizely/cms-sdk'
import {
  OptimizelyGridSection,
  StructureContainerProps,
  getPreviewUtils,
} from '@optimizely/cms-sdk/react/server'

function Row({ children, node }: StructureContainerProps) {
  const { pa } = getPreviewUtils(node)
  return (
    <div
      className="vb:row flex flex-1 flex-col flex-nowrap md:flex-row"
      {...pa(node)}
    >
      {children}
    </div>
  )
}

function Column({ children, node }: StructureContainerProps) {
  const { pa } = getPreviewUtils(node)
  return (
    <div
      className="vb:col flex flex-1 flex-col flex-nowrap justify-start"
      {...pa(node)}
    >
      {children}
    </div>
  )
}

type BlankSectionProps = {
  content: ContentProps<typeof BlankSectionContentType>
}

/** Defines a component to render a blank section */
export default function BlankSection({ content }: BlankSectionProps) {
  const { pa } = getPreviewUtils(content)
  return (
    <section
      className="vb:grid relative flex w-full flex-col flex-wrap"
      {...pa(content)}
    >
      <OptimizelyGridSection nodes={content.nodes} row={Row} column={Column} />
    </section>
  )
}
