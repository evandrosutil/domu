import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ExpenseForm from './ExpenseForm';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Button,
  useToast, Text, Alert, AlertIcon, AlertDescription, Spinner, Center, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';

function ExpenseListPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();

  const toast = useToast();

  const fetchExpenses = useCallback(async () => {
    setLoading(true); setError(null); try { const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`; const response = await axios.get(apiUrl); setExpenses(response.data.results || response.data || []); } catch (err) { console.error("Erro ao buscar despesas:", err); setError("Falha ao carregar despesas."); setExpenses([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
    toast({ title: "Despesa adicionada!", status: "success", duration: 3000, isClosable: true, position: "top-right" });
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm(`Tem certeza que deseja excluir a despesa ID ${expenseId}?`)) {
       try {
           const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${expenseId}/`;
           await axios.delete(apiUrl);
           setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
           toast({ title: "Despesa excluída!", status: "warning", duration: 3000, isClosable: true, position: "top-right" });
       } catch (err) {
           console.error(`Erro ao excluir despesa ${expenseId}:`, err.response || err); let errorMsg = `Falha ao excluir despesa ${expenseId}.`; if (err.response?.data && typeof err.response.data === 'object') { try { errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); } catch (e) { errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); } } else if (err.response?.data) { errorMsg += ' Detalhes: ' + err.response.data; } setError(errorMsg);
           toast({ title: "Erro ao excluir", description: errorMsg, status: "error", duration: 5000, isClosable: true, position: "top-right" });
       }
    }
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    onEditModalOpen();
  };

  
  const handleUpdateExpense = (updatedExpense) => {
    setExpenses(prevExpenses => prevExpenses.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense ));
    onEditModalClose(); 
    setEditingExpense(null); 
    toast({ title: "Despesa atualizada!", status: "success", duration: 3000, isClosable: true, position: "top-right" });
  };

  
  return (
    <Box p={{ base: 4, md: 6 }} maxW="1200px" mx="auto"> 
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Gerenciar Despesas
      </Heading>

      <Box p={5} borderWidth={1} borderRadius="lg" boxShadow="sm" mb={8} bg="white">
         <Heading as="h4" size="md" mb={4}>Adicionar Nova Despesa</Heading>
         <ExpenseForm onExpenseAdded={handleExpenseAdded} />
      </Box>

      <Heading as="h3" size="md" mb={4}>Despesas Registradas</Heading>
      {loading && <Center py={10}><Spinner color="teal.500" size="xl" /></Center>}
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && expenses.length > 0 ? (
        <Box borderWidth={1} borderRadius="lg" boxShadow="sm" bg="white" overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>Descrição</Th>
                <Th>Categoria</Th>
                <Th isNumeric>Valor (R$)</Th>
                <Th>Data</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.map(expense => (
                <Tr key={expense.id} _hover={{ bg: "gray.50" }}>
                  <Td>{expense.description}</Td>
                  <Td>{expense.category_name || '-'}</Td> 
                  <Td isNumeric>{parseFloat(expense.amount).toFixed(2)}</Td>
                  <Td>{new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label={`Editar despesa ${expense.description}`}
                        icon={<EditIcon />}
                        colorScheme="yellow"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(expense)}
                      />
                      <IconButton
                        aria-label={`Excluir despesa ${expense.description}`}
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)} 
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        !loading && !error && <Text color="gray.500" mt={4}>Nenhuma despesa registrada.</Text>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => { setEditingExpense(null); onEditModalClose(); }} isCentered>
         <ModalOverlay />
         <ModalContent> 
            <ModalHeader>Editar Despesa (ID: {editingExpense?.id})</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
               <ExpenseForm
                 initialData={editingExpense}
                 onExpenseUpdated={handleUpdateExpense}
               />
            </ModalBody>
            <ModalFooter>
              <Button onClick={onEditModalClose}>Cancelar</Button>
            </ModalFooter>
         </ModalContent>
      </Modal>

    </Box> 
  );
}

export default ExpenseListPage;
