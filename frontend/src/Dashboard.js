import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/summary/`;
        const response = await axios.get(apiUrl);
        setSummaryData(response.data); 
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
        setError("Falha ao carregar resumo de despesas.");
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // --- Dados e Opções para Gráfico de Barras (Mensal) ---
  const monthlyChartData = {
    labels: summaryData?.monthly_summary?.labels || [],
    datasets: [
      {
        label: 'Total Despesas por Mês (R$)',
        data: summaryData?.monthly_summary?.totals || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  // Opções do gráfico mensal
  const monthlyChartOptions = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', }, title: { display: true, text: 'Resumo Mensal de Despesas', }, tooltip: { callbacks: { label: function(context) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.raw || 0); } } } }, scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); } } } }
 };


  // --- Dados e Opções para Gráfico de Pizza (Categoria) ---
  const categoryChartData = {
    labels: summaryData?.category_summary?.labels || [],
    datasets: [
      {
        label: '# de Reais',
        data: summaryData?.category_summary?.totals || [],
        backgroundColor: [ // Paleta de cores para as fatias
          'rgba(255, 99, 132, 0.7)',  // Red
          'rgba(54, 162, 235, 0.7)',  // Blue
          'rgba(255, 206, 86, 0.7)',  // Yellow
          'rgba(75, 192, 192, 0.7)',  // Teal
          'rgba(153, 102, 255, 0.7)', // Purple
          'rgba(255, 159, 64, 0.7)',  // Orange
          'rgba(199, 199, 199, 0.7)', // Grey
          'rgba(83, 102, 255, 0.7)'  // Indigo
          // Adicione mais cores se tiver muitas categorias
        ],
        borderColor: [ // Cor da borda das fatias
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribuição de Despesas por Categoria',
      },
      tooltip: {
         callbacks: {
             label: function(context) {
                 let label = context.label || ''; // Nome da Categoria
                 let value = context.raw || 0; // Valor numérico
                 let formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                 // Calcular Porcentagem
                 // let total = context.chart.data.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
                 // let percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                 // return `${label}: <span class="math-inline">\{formattedValue\} \(</span>{percentage})`;
                 return `${label}: ${formattedValue}`;
             }
         }
      }
    },
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee', width: '100%', boxSizing: 'border-box' }}>
      <h2>Dashboard - Análise de Dados</h2>

      {loading && <p>Carregando resumos...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', marginTop: '20px' }}>

        {summaryData?.monthly_summary?.labels?.length > 0 ? (
           // Container do gráfico mensal
           <div style={{ position: 'relative', height: '400px', width: '90%', maxWidth: '600px', marginBottom:'20px' }}>
             <h3 style={{textAlign: 'center'}}>Resumo Mensal</h3>
             <Bar options={monthlyChartOptions} data={monthlyChartData} />
           </div>
        ) : (!loading && !error && <p>Não há dados para o resumo mensal.</p>)}

        {summaryData?.category_summary?.labels?.length > 0 ? (
           // Container do gráfico de categoria
           <div style={{ position: 'relative', height: '400px', width: '90%', maxWidth: '450px', marginBottom:'20px' }}>
             <h3 style={{textAlign: 'center'}}>Resumo por Categoria</h3>
             <Pie options={categoryChartOptions} data={categoryChartData} />
             {/* Ou use <Doughnut options={...} data={...} /> */}
           </div>
        ) : (!loading && !error && <p>Não há dados para o resumo por categoria.</p>)}

      </div>
      {!loading && !error && !summaryData?.monthly_summary?.labels?.length && !summaryData?.category_summary?.labels?.length && (
          <p>Não há dados suficientes para exibir os resumos.</p>
      )}
    </div>
  );
}

export default Dashboard;
