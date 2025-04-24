import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExpenseForm({ onExpenseAdded, initialData, onExpenseUpdated }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (isEditing && initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount || '');
      const formattedDate = initialData.date ? new Date(initialData.date + 'T00:00:00').toISOString().slice(0, 10) : '';
      setDate(formattedDate);
      setError(null);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!description || !amount || !date) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    const expenseData = {
      description: description,
      amount: parseFloat(amount),
      date: date,
    };

    try {
      let response;
      if (isEditing) {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${initialData.id}/`;
        console.log(`Enviando PUT para ${apiUrl} com dados:`, expenseData);
        response = await axios.put(apiUrl, expenseData);
        console.log("Resposta PUT:", response.data);
        if (onExpenseUpdated) {
          onExpenseUpdated(response.data);
        }
      } else {
        // --- MODO CRIAÇÃO: Faz requisição POST (como antes) ---
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`;
        console.log("Enviando POST para /expenses/ com dados:", expenseData);
        response = await axios.post(apiUrl, expenseData);
        console.log("Resposta POST:", response.data);
        if (onExpenseAdded) {
          onExpenseAdded(response.data);
        }
      }

      if (!isEditing) {
         setDescription('');
         setAmount('');
         setDate(new Date().toISOString().slice(0, 10));
      }

    } catch (err) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} despesa:`, err.response || err);
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : `Falha ao ${isEditing ? 'atualizar' : 'adicionar'} despesa.`;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      {/* Título dinâmico */}
      <h3>{isEditing ? `Editar Despesa` : 'Adicionar Nova Despesa'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
      <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
        {/* Texto do botão dinâmico */}
        {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Despesa')}
      </button>
    </form>
  );
}

export default ExpenseForm;
