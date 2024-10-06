import React from 'react';
import { ChakraProvider, Box, VStack } from "@chakra-ui/react"
import PasswordStrengthAnalyzer from './components/PasswordStrengthAnalyzer';

function App() {
  return (
    <ChakraProvider>
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100" padding={4}>
        <VStack spacing={8} p={8} bg="white" borderRadius="lg" boxShadow="lg" width="100%" maxWidth="600px">
          <PasswordStrengthAnalyzer />
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;