import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Box, Heading, Text, Spinner, Center, Alert, AlertIcon, AlertDescription, VStack, HStack,
  Stat, StatArrow, StatLabel, StatNumber, StatHelpText, StatGroup,
  Table, Thead, Tbody, Tr, Th, Td, Link as ChakraLink,
  Button, SimpleGrid, Icon
} from '@chakra-ui/react';
import { FaDollarSign, FaChartPie, FaCloudUploadAlt } from 'react-icons/fa';

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
      <VStack spacing={{ base: 8, md: 12 }} py={{ base: 10, md: 16 }} px={6} textAlign="center">

        <Box maxW="2xl"> 
          <Heading as="h2" size="2xl" mt={6} mb={4} color="teal.500"> 
            Simplifique a Gestão do seu Condomínio com Domu!
          </Heading>
          <Text fontSize={{base: "lg", md:"xl"}} color={'gray.600'} mb={8}>
            Organize despesas, visualize relatórios e tenha controle financeiro de forma fácil e acessível de onde estiver.
          </Text>
          <ChakraLink as={ReactRouterLink} to="/login" _hover={{ textDecoration: 'none' }}>
              <Button colorScheme="teal" variant="solid" size="lg" px={10} py={6} fontSize="lg">
                  Acessar Minha Conta
              </Button>
          </ChakraLink>
        </Box>

        <Box py={10} width="100%" maxW="5xl"> 
             <Heading as="h3" size="lg" mb={10}>Recursos Principais</Heading> 
             <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg" bg="white"> 
                   <Center color="teal.500" mb={4}>
                       <Icon as={FaDollarSign} w={12} h={12} />
                   </Center>
                   <Heading fontSize="xl" mb={2} textAlign="center">Controle de Despesas</Heading>
                   <Text color={'gray.600'} textAlign="center">
                     Registre e categorize todas as suas despesas de forma rápida e organizada.
                   </Text>
                </Box>
                <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                   <Center color="teal.500" mb={4}>
                       <Icon as={FaChartPie} w={12} h={12} />
                    </Center>
                   <Heading fontSize="xl" mb={2} textAlign="center">Análise Visual</Heading>
                   <Text color={'gray.600'} textAlign="center">
                     Gráficos mensais e por categoria para entender para onde vai o dinheiro.
                   </Text>
                </Box>
                <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                   <Center color="teal.500" mb={4}>
                       <Icon as={FaCloudUploadAlt} w={12} h={12} />
                   </Center>
                   <Heading fontSize="xl" mb={2} textAlign="center">Acesso Online</Heading>
                   <Text color={'gray.600'} textAlign="center">
                     Seus dados seguros e acessíveis de qualquer dispositivo conectado.
                   </Text>
                </Box>
             </SimpleGrid>
        </Box>
      </VStack>
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
