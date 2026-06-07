import { CAT_ICONS, CAT_COLORS } from '../data/constants'
import { fmt } from '../utils/formatters'
import EmptyState from './EmptyState'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function scheduleLabel(item) {
  if (item.frequency === 'weekly') return `weekly | ${days[item.dayOfWeek ?? 0]}`
  if (item.frequency === 'yearly') return `yearly | ${months[item.month ?? 0]} ${item.dayOfMonth}`
  return `monthly | day ${item.dayOfMonth}`
}

export default function RecurringPanel({ recurring, accounts, onToggle, onDelete }) {
  if (!recurring.length) {
    return (
      <div className="ft-card">
        <h3 className="ft-section-title mb-3">Recurring transactions</h3>
        <EmptyState icon="ti-refresh" title="No recurring transactions" subtitle="Mark a transaction as recurring when adding it." />
      </div>
    )
  }

  return (
    <div className="ft-card">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="ft-section-title">Recurring transactions</h3>
        <span className="text-[11px] text-ink-500 dark:text-ink-400">Active templates add the latest due item automatically.</span>
      </div>
      {recurring.map(r => {
        const icon = CAT_ICONS[r.category] || 'ti-dots'
        const color = CAT_COLORS[r.category] || '#888780'
        const sign = r.type === 'income' ? '+' : '−'
        const acc = accounts.find(a => a.id === r.accountId)
        return (
          <div key={r.id} className="grid grid-cols-[28px_1fr_auto_auto_auto] gap-2.5 items-center py-2 border-b border-ink-100 dark:border-ink-800/50 last:border-0 group text-sm">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: color + '22', color }}>
              <i className={`ti ${icon}`}></i>
            </div>
            <div>
              <div className="font-medium">
                {r.note || r.category}
                {!r.active && <span className="ml-2 text-[11px] text-ink-500">(paused)</span>}
              </div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                {r.category} | {scheduleLabel(r)}
              </div>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
              {acc?.name || '-'}
            </span>
            <div className={`tabular-nums font-medium ${r.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
              {sign}{fmt(r.amount)}
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => onToggle(r.id)} className="ft-icon-btn" title={r.active ? 'Pause' : 'Resume'}>
                <i className={`ti ${r.active ? 'ti-player-pause' : 'ti-player-play'} text-sm`}></i>
              </button>
              <button onClick={() => onDelete(r.id)} className="ft-icon-btn" title="Delete">
                <i className="ti ti-trash text-sm"></i>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
