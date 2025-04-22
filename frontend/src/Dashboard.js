import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
      try {
        setLoading(true);
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/summary/`;
        const response = await axios.get(apiUrl);
        setSummaryData(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
        setError("Falha ao carregar resumo de despesas.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const chartData = {
    labels: summaryData?.labels || [],
    datasets: [
      {
        label: 'Total Despesas por Mês (R$)',
        data: summaryData?.totals || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Azul
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Resumo Mensal de Despesas',
      },
      tooltip: {
         callbacks: {
             label: function(context) {
                 let label = context.dataset.label || '';
                 if (label) {
                     label += ': ';
                 }
                 if (context.parsed.y !== null) {
                     label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                 }
                 return label;
             }
         }
      }
    },
     scales: {
        y: {
            beginAtZero: true,
             ticks: {
                 callback: function(value) {
                     return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                 }
             }
        }
    }
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee' }}>
      <h2>Dashboard - Análise de Dados</h2>
      {loading && <p>Carregando resumo...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      {summaryData && summaryData.labels.length > 0 ? (
         <div style={{ position: 'relative', height: '400px', width: '80%', margin: 'auto' }}>
           <Bar options={chartOptions} data={chartData} />
         </div>
      ) : (
        !loading && <p>Não há dados suficientes para exibir o resumo.</p>
      )}
    </div>
  );
}

export default Dashboard;
