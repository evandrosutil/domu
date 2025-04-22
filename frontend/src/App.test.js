// domu/frontend/src/App.test.js
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios'; // Importa o axios para mocká-lo

// Mocka o módulo axios inteiro antes de todos os testes neste arquivo
jest.mock('axios');

// Teste 1: Verifica se renderiza sem quebrar (teste de fumaça)
test('renders without crashing', () => {
  // Mocka uma resposta básica para a primeira tentativa de renderização
  axios.get.mockResolvedValue({ data: [] }); // Retorna array vazio
  render(<App />);
  // Este teste apenas garante que não houve erro na renderização inicial
});

// Teste 2: Verifica se mostra o estado de carregamento inicialmente
test('shows loading state initially', () => {
  // Mocka uma Promise pendente para manter no estado de loading
  axios.get.mockImplementation(() => new Promise(() => {}));
  render(<App />);
  expect(screen.getByRole('heading', { name: /Carregando despesas.../i })).toBeInTheDocument();
});


// Teste 3: Verifica se exibe despesas após busca bem-sucedida
test('fetches and displays expenses', async () => {
  const mockExpenses = [
    { id: 1, description: 'Despesa Mock 1', amount: '15.00', date: '2025-04-22' },
    { id: 2, description: 'Despesa Mock 2', amount: '30.50', date: '2025-04-21' },
  ];
  // Configura o mock do axios.get para esta execução específica do teste
  axios.get.mockResolvedValue({ data: mockExpenses });

  render(<App />);

  // Espera até que os textos das despesas apareçam (findByText é assíncrono)
  // Use textos específicos dos seus dados mockados
  const expense1 = await screen.findByText(/Despesa Mock 1/i);
  const expense2 = await screen.findByText(/Despesa Mock 2/i);

  // Verifica se os elementos estão no documento
  expect(expense1).toBeInTheDocument();
  expect(expense2).toBeInTheDocument();

  // Verifica se a mensagem de "Carregando..." desapareceu
  expect(screen.queryByRole('heading', { name: /Carregando despesas.../i })).not.toBeInTheDocument();

  // Verifica se axios.get foi chamado com a URL correta (relativa à API base mockada ou verificando parte da string)
  // Como mockamos, a URL base exata não importa tanto, mas podemos verificar o endpoint
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/expenses\/$/));
});

// Teste 4: Verifica estado de erro (Opcional, mas bom)
test('shows error message on fetch failure', async () => {
    // Mocka uma requisição falha
    axios.get.mockRejectedValue(new Error("Erro de Rede Simulado"));

    render(<App />);

    // Espera a mensagem de erro aparecer
    const errorMessage = await screen.findByText(/Falha ao carregar despesas./i);
    expect(errorMessage).toBeInTheDocument();

    // Verifica se a mensagem de "Carregando..." desapareceu
    expect(screen.queryByRole('heading', { name: /Carregando despesas.../i })).not.toBeInTheDocument();
});
