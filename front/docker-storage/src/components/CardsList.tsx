import {Center, Flex} from '@mantine/core';
import React from 'react';

export default function CardList({children}: { children: React.ReactNode }) {
  return (
      <Flex pos={'fixed'} bottom={-50} wrap={'nowrap'}>
        <Center>
          {children}
        </Center>
      </Flex>
  );
}
