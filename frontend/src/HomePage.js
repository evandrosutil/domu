import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Box, Heading, Text, Spinner, Center, Alert, AlertIcon, AlertDescription, VStack, HStack,
  Stat, StatArrow, StatLabel, StatNumber, StatHelpText, StatGroup,
  Table, Thead, Tbody, Tr, Th, Td, Link as ChakraLink,
  Button 
} from '@chakra-ui/react';

function HomePage() {
  const { isAuthenticated } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHomepageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/homepage-summary/`;
      const response = await axios.get(apiUrl);
      setSummaryData(response.data);
    } catch (err) {
      console.error("Erro ao buscar resumo da home:", err.response || err);
      if (err.response?.status === 401 || err.response?.status === 403) {
         setError("Sessão inválida ou expirada. Por favor, faça login novamente.");
      } else {
         setError("Falha ao carregar dados da página inicial.");
      }
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHomepageData();
    } else {
      setSummaryData(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchHomepageData]);


  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Bem-vindo ao Domu!
        </Heading>
        <Text color={'gray.500'} mb={6}>
          Sua plataforma de gestão simplificada. Faça o login para acessar seus dados.
        </Text>
        <ChakraLink as={ReactRouterLink} to="/login">
            <Button colorScheme="teal" variant="solid" size="lg">
                Ir para Login
            </Button>
        </ChakraLink>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Resumo Geral
      </Heading>

      {loading && <Center py={10}><Spinner color="teal.500" size="xl" thickness="4px" /></Center>}

      {error && (
        <Center>
            <Alert status="error" borderRadius="md" maxW="600px" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
                <AlertIcon boxSize="40px" mr={0} />
                <AlertDescription mt={4} maxWidth="sm">{error}</AlertDescription>
                 <Button colorScheme="red" variant="link" mt={3} onClick={fetchHomepageData}>Tentar Novamente</Button>
                 {error.includes("login") && <ChakraLink as={ReactRouterLink} to="/login" mt={2}><Text fontSize="sm">Ir para Login</Text></ChakraLink>}
            </Alert>
        </Center>
      )}

      {!loading && !error && summaryData && (
        <VStack spacing={8} align="stretch">
                   <Box borderWidth={1} borderRadius="lg" boxShadow="base" p={6} bg="white">
             <Heading as="h3" size="md" mb={4}>Resumo de {summaryData.summary_period_label || 'Mês Atual'}</Heading>
             <StatGroup>
                <Stat>
                   <StatLabel fontSize="md">Total Gasto no Mês</StatLabel>
                   <StatNumber
                     fontSize={{ base: '2xl', md: '3xl' }} 
                     color={
                        (summaryData.current_month_total > summaryData.previous_month_total && summaryData.previous_month_total > 0)
                          ? "red.500" 
                          : (summaryData.current_month_total < summaryData.previous_month_total ? "green.500" : "gray.600")
                     }
                   >
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summaryData.current_month_total || 0)}
                   </StatNumber>
                   {summaryData.previous_month_total != null ? ( 
                      <StatHelpText mb={0}> 
                         {summaryData.previous_month_total > 0 ? 
                            ( () => {
                               const change = ((summaryData.current_month_total - summaryData.previous_month_total) / summaryData.previous_month_total) * 100;
                               return (
                                  <>
                                     <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
                                     {Math.abs(change).toFixed(1)}% vs. mês anterior
                                     <Text as='span' fontSize='xs' color='gray.500' ml={1}>
                                        ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summaryData.previous_month_total)})
                                     </Text>
                                  </>
                               );
                            })() 
                         : (summaryData.current_month_total > 0 ? 
                             <>
                                 <StatArrow type='increase' />
                                 (Mês anterior foi R$ 0,00)
                             </>
                             : 
                             "(Igual ao mês anterior - R$ 0,00)"
                           )
                         }
                      </StatHelpText>
                   ): (
                       <StatHelpText mb={0}>Sem dados do mês anterior.</StatHelpText> 
                   )}
                </Stat>

                {summaryData.top_category_current_month && (
                  <Stat>
                     <StatLabel fontSize="md">Top Categoria (Mês)</StatLabel>
                     <StatNumber fontSize="2xl"> 
                       {summaryData.top_category_current_month.category__name || 'N/A'} 
                     </StatNumber>
                     <StatHelpText>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summaryData.top_category_current_month.total || 0)}
                     </StatHelpText>
                  </Stat>
                )}
             </StatGroup>
          </Box>

          <Box borderWidth={1} borderRadius="lg" boxShadow="base" p={6} bg="white">
             <Heading as="h3" size="md" mb={4}>Últimas 5 Despesas</Heading>
             {summaryData.recent_expenses?.length > 0 ? (
               <Box overflowX="auto">
                 <Table variant="simple" size="sm">
                   <Thead>
                     <Tr>
                       <Th>Descrição</Th>
                       <Th>Categoria</Th>
                       <Th isNumeric>Valor</Th>
                       <Th>Data</Th>
                     </Tr>
                   </Thead>
                   <Tbody>
                     {summaryData.recent_expenses.map(expense => (
                       <Tr key={expense.id}>
                         <Td>{expense.description}</Td>
                         <Td>{expense.category_name || '-'}</Td>
                         <Td isNumeric>{parseFloat(expense.amount).toFixed(2)}</Td>
                         <Td>{new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}</Td>
                       </Tr>
                     ))}
                   </Tbody>
                 </Table>
               </Box>
             ) : (
               <Text color="gray.500">Nenhuma despesa recente encontrada.</Text>
             )}
             <Box mt={4} textAlign="right">
                <ChakraLink as={ReactRouterLink} to="/expenses" color="teal.600" fontWeight="bold">
                    Ver todas as despesas &rarr;
                </ChakraLink>
             </Box>
          </Box>

        </VStack>
      )}
    </Box>
  );
}

export default HomePage;
