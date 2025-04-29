import React from 'react';
import { Routes, Route, Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Link as ChakraLink, Button, Spacer, Heading, Text } from '@chakra-ui/react';
import './App.css';

import HomePage from './HomePage';
import ExpenseListPage from './ExpenseListPage';
import DashboardPage from './DashboardPage';
import CategoryManagementPage from './CategoryManagementPage';
import LoginPage from './LoginPage';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout();
        navigate('/');
    }

    return (
    <Box>
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.2rem"
            bg="teal.600"
            color="white"
            marginBottom="20px"
            position="sticky"
            top="0"
            zIndex="sticky"
        >
            <Flex align="center" mr={5}>
                <ChakraLink as={ReactRouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                    <Heading as="h1" size="lg" letterSpacing={'-1.rem'}>
                        Domu
                    </Heading>
                </ChakraLink>
            </Flex>

        <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
            {auth.isAuthenticated && (
                <>
                    <ChakraLink as={ReactRouterLink} to="/expenses" mr={4} _hover={{ color: 'teal.100' }}>
                        Despesas
                    </ChakraLink>
                    <ChakraLink as={ReactRouterLink} to="/categories" mr={4} _hover={{ color: 'teal.100' }}>
                        Categorias
                    </ChakraLink>
                    <ChakraLink as={ReactRouterLink} to="/dashboard" mr={4} _hover={{ color: 'teal.100' }}>
                        Dashboard
                    </ChakraLink>
                </>
            )}
        </Box>

        <Spacer />

        <Box>
            {auth.isAuthenticated ? (
                <Button onClick={handleLogout} colorScheme="teal" variant="solid" size="sm" _hover={{ bg: 'teal.700' }}>
                    Sair
                </Button>
            ) : (
                <ChakraLink as={ReactRouterLink} to="/login">
                    <Button colorScheme="teal" variant="solid" size="sm">
                        Login
                    </Button>
                </ChakraLink>
            )}
        </Box>
        
        </Flex>
        
        <Box paddingX="4" paddingY="2">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/expenses" element={ <ProtectedRoute><ExpenseListPage /></ProtectedRoute> } />
                <Route path="/dashboard" element={ <ProtectedRoute><DashboardPage /></ProtectedRoute> } />
                <Route path="/categories" element={ <ProtectedRoute><CategoryManagementPage /></ProtectedRoute> } />

                <Route path="*" element={ <Heading as="h2" size="xl" textAlign="center" mt="10">404 - Página Não Encontrada!</Heading> } />
            </Routes>
        </Box>
    </Box>
    );
}

export default App;
