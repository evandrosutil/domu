import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders without crashing', () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<App />);
});

test('shows loading state initially', () => {
  axios.get.mockImplementation(() => new Promise(() => {}));
  render(<App />);
  expect(screen.getByRole('heading', { name: /Carregando despesas.../i })).toBeInTheDocument();
});

test('fetches and displays expenses', async () => {
  const mockExpenses = [
    { id: 1, description: 'Despesa Mock 1', amount: '15.00', date: '2025-04-22' },
    { id: 2, description: 'Despesa Mock 2', amount: '30.50', date: '2025-04-21' },
  ];
  const mockSummary = { labels: ['2025-04'], totals: [45.50] };

  axios.get.mockImplementation(url => {
    if (url.includes('/api/expenses/summary/')) {
      return Promise.resolve({ data: mockSummary });
    } else if (url.includes('/api/expenses/')) {
      return Promise.resolve({ data: mockExpenses });
    }
    return Promise.reject(new Error('URL não mockada: ' + url));
  });

  render(<App />);

  expect(await screen.findByText(/Despesa Mock 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/Despesa Mock 2/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: /Carregando despesas.../i })).not.toBeInTheDocument();
  });

  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/expenses\/$/));
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/expenses\/summary\/$/));
});

test('shows error message on fetch failure', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('/api/expenses/summary/')) {
        return Promise.resolve({ data: { labels: [], totals: [] } });
      } else if (url.includes('/api/expenses/')) {
        return Promise.reject(new Error("Erro de Rede Simulado"));
      }
      return Promise.reject(new Error('URL não mockada: ' + url));
    });

    render(<App />);

    expect(await screen.findByText(/Falha ao carregar despesas./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Carregando despesas.../i })).not.toBeInTheDocument();
    });
});
