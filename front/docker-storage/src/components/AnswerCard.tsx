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
          w={130} h={180} ref={ref} pos={'relative'}
          bottom={hovered ? 30 : 0}
          className={'card'}>
      <ScrollArea mah={180} maw={130} type={'never'}>
        <Text size={'sm'} ta={'left'}>{props.text}</Text>
      </ScrollArea>
    </Card>
  );
}
