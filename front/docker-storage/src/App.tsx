import './App.css'
import '@mantine/core/styles.css'
import {Center, Flex, MantineProvider} from '@mantine/core';
import QuestionCard from './components/QuestionCard.tsx';
import CardsLists from './components/CardsList.tsx';

function App() {

  return (
      <MantineProvider>
        <Center>
          <Flex justify={'space-between'} gap={'md'}>
            <QuestionCard text={''} placeholder/>
            <QuestionCard text={''} placeholder/>
          </Flex>
          <CardsLists>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
            <QuestionCard text={'test'}/>
          </CardsLists>
        </Center>
      </MantineProvider>
  );
}

export default App
