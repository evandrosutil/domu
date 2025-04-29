import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate, Link as ReactRouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Center,
  Link as ChakraLink,
  VStack
} from '@chakra-ui/react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/expenses";

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, from]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const success = await auth.login(username, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Center minH="calc(80vh)"> 
      <Box
        p={8}
        maxWidth="450px"
        width="100%"
        borderWidth={1} 
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
        color="gray.700"
      >
        <Heading as="h2" size="lg" textAlign="center" mb={6}> {/* mb = margin-bottom */}
          Login - Domu
        </Heading>

        <form onSubmit={handleLoginSubmit}>
          <VStack spacing={4} align="stretch">
            {/* Campo Usuário */}
            <FormControl id="login-username-chakra" isRequired isInvalid={!!auth.authError}> {/* isInvalid marca se houver erro */}
              <FormLabel>Usuário:</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                focusBorderColor="teal.500"
              />
            </FormControl>

            <FormControl id="login-password-chakra" isRequired isInvalid={!!auth.authError}>
              <FormLabel>Senha:</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                focusBorderColor="teal.500"
              />
            </FormControl>

            {auth.authError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{auth.authError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={auth.authLoading}
              loadingText="Entrando..."
            >
              Entrar
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" fontSize="sm" mt={6}>
          <ChakraLink as={ReactRouterLink} to="/" color="teal.600">
            Voltar para Home
          </ChakraLink>
        </Text>
      </Box>
    </Center>
  );
}

export default LoginPage;
