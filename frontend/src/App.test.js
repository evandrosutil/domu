import { render, screen } from '@testing-library/react';
import App from './App';

// Teste básico: verifica se o componente App renderiza sem quebrar
test('renders without crashing', () => {
  render(<App />);
  // Este teste apenas garante que não houve erro durante a renderização inicial
});

// Teste específico: verifica se o título principal está na tela
test('renders main page heading', () => {
  render(<App />);
  // Busca por um elemento com role 'heading' e o nome/texto específico
  // Usar 'name' faz a busca pelo conteúdo acessível do heading
  const headingElement = screen.getByRole('heading', { name: /Gestão de Despesas Domu/i });
  // Verifica se o elemento foi encontrado no documento
  expect(headingElement).toBeInTheDocument();
});

// Poderíamos adicionar testes mais complexos aqui, como simular
// o preenchimento do formulário ou verificar a exibição da lista
// após mockar a chamada API, mas vamos manter simples por enquanto.
