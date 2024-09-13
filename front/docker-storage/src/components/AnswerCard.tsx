import { Card, ScrollArea, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import '../App.css';

interface Props {
  text: String,
}


export default function AnswerCard(props: Props) {
  const { hovered, ref } = useHover();

  return (
    <Card shadow={'sm'} withBorder radius={'lg'}
          w={{ base: 115, xs: 130 }}
          h={{ base: 150, xs: 180 }}
          ref={ref} pos={'relative'}
          bottom={{ base: hovered ? 50 : 0, xs: hovered ? 30 : 0 }}
          className={'card'}>
      <ScrollArea mah={{ base: 145, xs: 180 }}
                  type={'never'}>
        <Text size={'xs'} ta={'left'} hiddenFrom={'xs'}>{props.text}</Text>
        <Text size={'sm'} ta={'left'} visibleFrom={'xs'}>{props.text}</Text>
      </ScrollArea>
    </Card>
  );
}
