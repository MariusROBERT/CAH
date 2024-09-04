import './App.css'
import '@mantine/core/styles.css'
import {useState} from 'react';
import {useListState} from '@mantine/hooks';
import {DragDropContext, Draggable, DraggableLocation, Droppable} from '@hello-pangea/dnd';
import {Card, Center, Flex, MantineProvider} from '@mantine/core';
import classes from './DndList.module.css';
import cx from 'clsx';
import AnswerCard from './components/AnswerCard.tsx';


function App() {
  const [answerNumber] = useState(1)
  const [playedCards, setPlayedCards] = useListState<{ id: number, text: string }>([])
  const [answerCards, setAnswerCards] = useListState<{ id: number, text: string }>([
    {id: 1, text: 'Answer 1'},
    {id: 2, text: 'Answer 2'},
    {id: 3, text: 'Answer 3'},
    {id: 4, text: 'Answer 4'},
    {id: 5, text: 'Answer 5'},
    {id: 6, text: 'Answer 6'},
    {id: 7, text: 'Answer 7'},
  ])

  const move = (source: { id: number, text: string }[],
                destination: { id: number, text: string }[],
                droppableSource: DraggableLocation,
                droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);

    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: any = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  function getList(id: string) {
    return id === 'answer-cards' ? answerCards : playedCards;
  }

  return (
      <MantineProvider>
        <DragDropContext
            onDragEnd={({destination, source}) => {

              if (!destination)
                return;

              if (source.droppableId === destination.droppableId) {
                setAnswerCards.reorder({from: source.index, to: destination?.index || 0})
              } else {
                const result = move(
                    getList(source.droppableId),
                    getList(destination.droppableId),
                    source,
                    destination
                );

                setAnswerCards.setState(result['answer-cards']);
                setPlayedCards.setState(result['played-cards']);
              }
            }}
        >

          <Card shadow={'sm'} withBorder radius={'lg'}
                w={answerNumber * 160} h={230} pos={'relative'}
                className={'played'}
          >
            <Droppable droppableId={'played-cards'} direction={'horizontal'}>
              {(provided) => (
                    <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}
                          {...provided.droppableProps}
                          ref={provided.innerRef}>
                      {playedCards.map((item, index) => (
                          <Draggable key={item.id} index={index} draggableId={item.id + ''}>
                            {(provided, snapshot) => (
                                <div
                                    className={cx(classes.item, {[classes.itemDragging]: snapshot.isDragging})}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                >
                                  <AnswerCard text={item.text}/>
                                </div>
                            )}
                          </Draggable>
                      ))}
                      {provided.placeholder}
                    </Flex>
              )}
            </Droppable>
          </Card>

          <Droppable droppableId={'answer-cards'} direction={'horizontal'}>
            {(provided) => (
                <Center>
                  <Flex bottom={-30} mx={'sm'} pl={20}
                        pos={'fixed'}
                        className={'hand'}
                        {...provided.droppableProps}
                        ref={provided.innerRef}>
                    {answerCards.map((item, index) => (
                        <Draggable key={item.id} index={index} draggableId={item.id + ''}>
                          {(provided, snapshot) => (
                              <div
                                  className={cx(classes.item, {[classes.itemDragging]: snapshot.isDragging})}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                              >
                                <AnswerCard text={item.text}/>
                              </div>
                          )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                  </Flex>
                </Center>
            )}
          </Droppable>
        </DragDropContext>
      </MantineProvider>
  );
}

export default App
