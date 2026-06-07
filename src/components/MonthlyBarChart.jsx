import { Bar } from 'react-chartjs-2'
import './chartSetup'
import { fmt, fmtShort } from '../utils/formatters'

export default function MonthlyBarChart({ txs, currentMonth, currentYear }) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const inc = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === 'income'
    }).reduce((s, t) => s + t.amount, 0)
    const exp = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === 'expense'
    }).reduce((s, t) => s + t.amount, 0)
    months.push({ label: d.toLocaleString('en-US', { month: 'short' }), inc: Math.round(inc), exp: Math.round(exp) })
  }

  const textColor = document.documentElement.classList.contains('dark') ? '#a8a29e' : '#57534e'

  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Bar
        data={{
          labels: months.map(m => m.label),
          datasets: [
            { label: 'Income', data: months.map(m => m.inc), backgroundColor: '#1D9E75', borderRadius: 3, barThickness: 14 },
            { label: 'Expenses', data: months.map(m => m.exp), backgroundColor: '#E24B4A', borderRadius: 3, barThickness: 14 },
          ],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { font: { size: 11 }, boxWidth: 8, padding: 8, color: textColor } },
            tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.y, 0)}` } },
          },
          scales: {
            y: { ticks: { font: { size: 10 }, callback: v => fmtShort(v), color: textColor }, grid: { color: 'rgba(168, 162, 158, 0.15)' } },
            x: { ticks: { font: { size: 10 }, color: textColor }, grid: { display: false } },
          },
        }}
      />
    </div>
  )
}
