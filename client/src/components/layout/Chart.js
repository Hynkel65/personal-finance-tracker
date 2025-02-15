import React, { useContext, useEffect, useState } from 'react';
import { Chart as ChartJs, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { GlobalContext } from '../context/GlobalState';
import moneyFormatter from "../utils/MoneyFormatter";

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function groupByMonth(data) {
  const groupedData = {};
  data.forEach(item => {
    const month = item.date.substring(0, 7);
    if (!groupedData[month]) {
      groupedData[month] = { income: 0, expense: 0 };
    }
    groupedData[month].income += item.amount;
  });

  return Object.entries(groupedData).map(([month, { income }]) => ({
    month,
    income,
  }));
}

function Chart() {
  const { incomes, expenses } = useContext(GlobalContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const groupedIncomes = groupByMonth(incomes);
    const groupedExpenses = groupByMonth(expenses);

    const mergedData = groupedIncomes.map(({ month, income }) => ({
      month,
      income,
      expense: (groupedExpenses.find(exp => exp.month === month) || { income: 0 }).income,
    }));

    setChartData(mergedData);
  }, [incomes, expenses]);

  const data = {
    labels: chartData.map(item => item.month),
    datasets: [
      {
        label: 'Pemasukan',
        data: chartData.map(item => item.income),
        backgroundColor: 'green',
        borderColor: 'white',
        tension: 0.2,
      },
      {
        label: 'Pengeluaran',
        data: chartData.map(item => item.expense),
        backgroundColor: 'red',
        borderColor: 'white',
        tension: 0.2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return moneyFormatter(context.raw);
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#fff',
        },
        ticks: {
          color: '#fff',
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        },
      },
      y: {
        grid: {
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 8,
      },
    },
    maintainAspectRatio: false
  };

  return (
    <div className="chart">
      <Line data={data} options={options} />
    </div>
  );
}

export default Chart;