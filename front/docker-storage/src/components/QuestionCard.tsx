import { Card, ScrollArea, Text } from '@mantine/core';

interface Props {
  question: string,
}

export default function QuestionCard(props: Props) {
  return (
    <Card shadow={'sm'} withBorder radius={'lg'}
          w={{ base: 120, xs: 160 }} h={{ base: 170, xs: 225 }}
          pos={'absolute'} top={15}
          bg={'dark'}
    >
      <ScrollArea mah={{ base: 170, xs: 225 }}
                  maw={{ base: 120, xs: 160 }}
                  type={'never'}>
        <Text c={'white'} size={'xs'} ta={'left'} hiddenFrom={'xs'}>{props.question}</Text>
        <Text c={'white'} size={'sm'} ta={'left'} visibleFrom={'xs'}>{props.question}</Text>
      </ScrollArea>
    </Card>
  );
}
