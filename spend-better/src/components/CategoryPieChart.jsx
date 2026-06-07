import { Doughnut } from 'react-chartjs-2'
import './chartSetup'
import { CAT_COLORS } from '../data/constants'
import { fmt } from '../utils/formatters'
import EmptyState from './EmptyState'

export default function CategoryPieChart({ breakdown }) {
  const labels = Object.keys(breakdown)
  const data = Object.values(breakdown).map(v => Math.round(v * 100) / 100)
  const colors = labels.map(l => CAT_COLORS[l] || '#888780')

  if (!labels.length) return <EmptyState icon="ti-chart-pie" title="No expenses" subtitle="Add expenses to see breakdown." />

  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] }}
        options={{
          responsive: true, maintainAspectRatio: false, cutout: '62%',
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 8, padding: 8, color: getTextColor() } },
            tooltip: { callbacks: { label: c => `${c.label}: ${fmt(c.parsed)}` } },
          },
        }}
      />
    </div>
  )
}

function getTextColor() {
  return document.documentElement.classList.contains('dark') ? '#e7e5e4' : '#292524'
}
