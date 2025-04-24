import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExpenseForm({ onExpenseAdded, initialData, onExpenseUpdated }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fetchCategoriesError, setFetchCategoriesError] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    const fetchCategories = async () => {
      setFetchCategoriesError(null);
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`;
        const response = await axios.get(apiUrl);
        setCategories(response.data || []);
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
    } else {
      setDescription('');
      setAmount('');
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
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${initialData.id}/`
        console.log(`Enviando PUT para ${apiUrl} com dados:`, expenseData);
        response = await axios.put(apiUrl, expenseData);
        if (onExpenseUpdated) {
          onExpenseUpdated(response.data);
        }
      } else {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`;
        console.log("Enviando POST para /expenses/ com dados:", expenseData);
        response = await axios.post(apiUrl, expenseData);
        if (onExpenseAdded) {
          onExpenseAdded(response.data);
        }
      }

      if (!isEditing) {
         setDescription('');
         setAmount('');
         setDate(new Date().toISOString().slice(0, 10));
         setSelectedCategoryId('');
      }

    } catch (err) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} despesa:`, err.response?.data || err.response || err);
      let errorMsg = `Falha ao ${isEditing ? 'atualizar' : 'adicionar'} despesa.`;
      // Tenta mostrar erro de validação do DRF
      if (err.response?.data && typeof err.response.data === 'object') {
          try {
              errorMsg = Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
          } catch (e) {
              errorMsg = JSON.stringify(err.response.data);
          }
      } else if (err.response?.data) {
         errorMsg = err.response.data;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      <h3>{isEditing ? `Editar Despesa ID: ${initialData.id}` : 'Adicionar Nova Despesa'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Campos existentes */}
      <div>
        <label htmlFor="description">Descrição: </label>
        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="amount">Valor: </label>
        <input type="number" id="amount" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="date">Data: </label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div style={{ marginTop: '10px' }}>
          <label htmlFor="category">Categoria: </label>
          {fetchCategoriesError && <p style={{ color: 'orange', fontSize: 'small' }}>{fetchCategoriesError}</p>}
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)} 
            disabled={categories.length === 0 && !fetchCategoriesError}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing:'border-box', marginTop: '5px' }}
          >
            <option value="">-- Nenhuma --</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
      </div>

      <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
        {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Despesa')}
      </button>
    </form>
  );
}

export default ExpenseForm;
