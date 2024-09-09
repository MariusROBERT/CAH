import { Card, Text } from '@mantine/core';

interface Props {
  question: string,
}

export default function QuestionCard(props: Props) {
  return (
    <Card shadow={'sm'} withBorder radius={'lg'}
          w={160} h={225} pos={'absolute'} top={15} bg={'dark'}
          className={''}
    >
      <Text c={'white'} size={'sm'} ta={'left'}>{props.question}</Text>
    </Card>
  );
}
