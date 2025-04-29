import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, FormControl, FormLabel, Input, Select, Heading,
  Alert, AlertIcon, AlertDescription, VStack, Text
} from '@chakra-ui/react';

function ExpenseForm({ onExpenseAdded, initialData, onExpenseUpdated }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [fetchCategoriesError, setFetchCategoriesError] = useState(null); 

  const isEditing = Boolean(initialData);

  useEffect(() => {
    const fetchCategories = async () => {
      setFetchCategoriesError(null);
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`;
        const response = await axios.get(apiUrl);
        setCategories(response.data.results || response.data || []);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setFetchCategoriesError("Falha ao carregar categorias.");
        setCategories([]);
      }
    };
    fetchCategories();
  }, []); 

  
  useEffect(() => {
    if (isEditing && initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount || '');
      const formattedDate = initialData.date ? new Date(initialData.date + 'T00:00:00').toISOString().slice(0, 10) : '';
      setDate(formattedDate);
      setSelectedCategoryId(initialData.category || ''); 
      setError(null); 
    } else if (!isEditing) {
      setDate(new Date().toISOString().slice(0, 10));
      setSelectedCategoryId('');
    }
  }, [initialData, isEditing]); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); 
    setLoading(true); 

    
    if (!description || !amount || !date) {
      setError("Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data).");
      setLoading(false);
      return;
    }

    const expenseData = {
      description: description,
      amount: parseFloat(amount), 
      date: date,
      category: selectedCategoryId ? parseInt(selectedCategoryId, 10) : null 
    };

    try {
      let response;
      if (isEditing) {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${initialData.id}/`;
        response = await axios.put(apiUrl, expenseData);
        if (onExpenseUpdated) {
          onExpenseUpdated(response.data); 
        }
      } else {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`;
        response = await axios.post(apiUrl, expenseData);
        if (onExpenseAdded) {
          onExpenseAdded(response.data); 
        }
        
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().slice(0, 10));
        setSelectedCategoryId('');
      }
    } catch (err) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} despesa:`, err.response?.data || err.response || err);
      let errorMsg = `Falha ao ${isEditing ? 'atualizar' : 'adicionar'} despesa.`;
      if (err.response?.data && typeof err.response.data === 'object') {
          try {
              errorMsg = Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
          } catch (e) { errorMsg = JSON.stringify(err.response.data); }
      } else if (err.response?.data) { errorMsg = err.response.data; }
      setError(errorMsg); 
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">

      <VStack spacing={4} align="stretch">

        <FormControl id="expense-description" isRequired isInvalid={!!error && (error.toLowerCase().includes('description') || error.includes('Descrição'))}>
          <FormLabel>Descrição:</FormLabel>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Conta de Luz Março"
            focusBorderColor="teal.500"
            isDisabled={loading}
          />
        </FormControl>

        <FormControl id="expense-amount" isRequired isInvalid={!!error && (error.toLowerCase().includes('amount') || error.includes('Valor'))}>
          <FormLabel>Valor (R$):</FormLabel>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 123.45"
            focusBorderColor="teal.500"
            isDisabled={loading}
          />
        </FormControl>

        <FormControl id="expense-date" isRequired isInvalid={!!error && (error.includes('date') || error.includes('Data'))}>
          <FormLabel>Data:</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            focusBorderColor="teal.500"
            isDisabled={loading}
          />
        </FormControl>

        <FormControl id="expense-category" isInvalid={!!fetchCategoriesError || (!!error && error.toLowerCase().includes('category'))}>
          <FormLabel>Categoria:</FormLabel>
          {fetchCategoriesError && <Text color="red.500" fontSize="sm" mb={1}>{fetchCategoriesError}</Text>}
          <Select
            placeholder="-- Nenhuma --" 
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            isDisabled={loading || (categories.length === 0 && !fetchCategoriesError)}
            focusBorderColor="teal.500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {error && (
          <Alert status="error" borderRadius="md" fontSize="sm">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          mt={4} 
          colorScheme="teal" 
          isLoading={loading} 
          loadingText={isEditing ? 'Salvando...' : 'Adicionando...'} 
          type="submit"
          alignSelf="flex-end" 
        >
          {isEditing ? 'Salvar Alterações' : 'Adicionar Despesa'}
        </Button>
      </VStack>
    </Box>
  );
}

export default ExpenseForm;
