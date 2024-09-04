import {Card, Text, UnstyledButton} from '@mantine/core';
import {useHover} from '@mantine/hooks';
import '../App.css'

interface Props {
  text: String,
  placeholder?: boolean;
}

export default function QuestionCard(props: Props) {
  const {hovered, ref} = useHover();

  return (
      <UnstyledButton>
        <Card shadow={'sm'} withBorder radius={'lg'}
              w={130} h={190} ref={ref} pos={'relative'}
              bottom={(hovered && !props.placeholder) ? 30 : 0}
              ml={props.placeholder ? 0 : -15} className={'card'}>
          <Text size={'sm'} ta={'left'}>{props.text}</Text>
        </Card>
      </UnstyledButton>
  )
}
