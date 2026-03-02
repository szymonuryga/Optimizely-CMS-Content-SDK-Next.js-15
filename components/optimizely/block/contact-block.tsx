import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { contentType, ContentProps } from '@optimizely/cms-sdk'

export const ContactBlockContentType = contentType({
  key: 'ContactBlock',
  displayName: 'Contact Block',
  baseType: '_component',
  properties: {
    title: {
      type: 'string',
      displayName: 'Title',
      localized: true,
    },
    description: {
      type: 'string',
      displayName: 'Description',
      localized: true,
      sortOrder: 10,
    },
  },
})

type Props = {
  content: ContentProps<typeof ContactBlockContentType>
}

export default function ContactBlock({ content }: Props) {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle data-epi-edit="title">{content?.title}</CardTitle>
          <p data-epi-edit="description" className="text-muted-foreground">
            {content?.description}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <Input placeholder="Name" />
            <Input placeholder="Email" type="email" />
            <Textarea placeholder="Message" />
            <Button className="w-full">Send</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
