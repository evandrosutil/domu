import React, { useState } from 'react';
import axios from 'axios';

function ExpenseForm({ onExpenseAdded }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
            const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`;
            const response = await axios.post(apiUrl, expenseData);

            onExpenseAdded(response.data);

            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().slice(0,10));
        } catch (err) {
            console.error("error adding new expense:", err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Falha ao adicionar despesa. Verique os dados ou tente novamente.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <h3>Adicionar Nova Despesa</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="description">Descrição: </label>
                <input 
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />  
            </div>
            <div style={{ marginTop: '10px' }}>
                <label htmlFor="amount">Valor: </label>
                <input
                    type="number"
                    id="amount"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <div style={{ marginTop: '10px' }}>
                <label htmlFor="date">Data: </label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading} style={{ margionTop: '15px' }}>
                {loading ? 'Salvando...' : 'Adicionar Despesa'}
            </button>
        </form>
    );
}

export default ExpenseForm;
