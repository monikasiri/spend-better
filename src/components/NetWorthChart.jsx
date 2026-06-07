import { Line } from 'react-chartjs-2'
import './chartSetup'
import { fmt, fmtShort } from '../utils/formatters'

export default function NetWorthChart({ txs, accounts, currentMonth, currentYear }) {
  const months = []
  const startDate = new Date(currentYear, currentMonth - 11, 1)
  let running = accounts.reduce((s, a) => s + a.startBalance, 0)

  txs.filter(t => new Date(t.date) < startDate).forEach(t => {
    const acc = accounts.find(a => a.id === t.accountId)
    if (!acc) return
    if (acc.type === 'credit') running += t.type === 'expense' ? -t.amount : t.amount
    else running += t.type === 'income' ? t.amount : -t.amount
  })

  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const monthTxs = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    })
    monthTxs.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId)
      if (!acc) return
      if (acc.type === 'credit') running += t.type === 'expense' ? -t.amount : t.amount
      else running += t.type === 'income' ? t.amount : -t.amount
    })
    months.push({ label: d.toLocaleString('en-US', { month: 'short' }), val: Math.round(running) })
  }

  // If nothing has changed across the 12 months (no transaction history), show empty state
  const allSame = months.every(m => m.val === months[0].val)
  if (allSame && txs.length === 0) {
    return (
      <div style={{ position: 'relative', height: 180 }} className="flex items-center justify-center text-center">
        <div className="text-ink-500 dark:text-ink-400">
          <i className="ti ti-chart-line text-2xl opacity-40 block mb-1"></i>
          <div className="text-xs">Add transactions across multiple months to see your net worth trend</div>
        </div>
      </div>
    )
  }

  const textColor = document.documentElement.classList.contains('dark') ? '#a8a29e' : '#57534e'

  return (
    <div style={{ position: 'relative', height: 180 }}>
      <Line
        data={{
          labels: months.map(m => m.label),
          datasets: [{
            label: 'Net worth', data: months.map(m => m.val),
            borderColor: '#7F77DD', backgroundColor: 'rgba(127, 119, 221, 0.13)',
            fill: true, tension: 0.3, pointRadius: 2, pointHoverRadius: 4, borderWidth: 2,
          }],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.y, 0) } } },
          scales: {
            y: { ticks: { font: { size: 10 }, callback: v => fmtShort(v), color: textColor }, grid: { color: 'rgba(168, 162, 158, 0.15)' } },
            x: { ticks: { font: { size: 10 }, color: textColor }, grid: { display: false } },
          },
        }}
      />
    </div>
  )
}
