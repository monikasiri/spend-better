import { CAT_ICONS, CAT_COLORS } from '../data/constants'
import { fmt } from '../utils/formatters'

export default function TransactionRow({ tx, accounts, onEdit, onDelete, onTagClick, showActions = true }) {
  const acc = accounts.find(a => a.id === tx.accountId)
  let icon, color, displayCat
  if (tx.splits && tx.splits.length) {
    icon = 'ti-arrows-split-2'
    color = '#534AB7'
    displayCat = `${tx.splits.length} categories`
  } else {
    icon = CAT_ICONS[tx.category] || 'ti-dots'
    color = CAT_COLORS[tx.category] || '#888780'
    displayCat = tx.category
  }
  const sign = tx.type === 'income' ? '+' : '−'
  const date = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="grid grid-cols-[32px_1fr_auto_auto_auto] gap-3 items-center py-2.5 border-b border-ink-100 dark:border-ink-800/60 last:border-0 group text-sm hover:bg-ink-50/50 dark:hover:bg-ink-800/20 -mx-2 px-2 rounded-lg transition">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: color + '22', color }}
      >
        <i className={`ti ${icon}`}></i>
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate flex items-center gap-1.5 text-[13.5px]">
          {tx.note || displayCat}
          {tx.recurringId && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 uppercase tracking-wider">
              Recurring
            </span>
          )}
          {tx.splits && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 uppercase tracking-wider">
              Split
            </span>
          )}
        </div>
        <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5 flex gap-1.5 items-center flex-wrap">
          <span>{displayCat} | {date}</span>
          {(tx.tags || []).map(tag => (
            <span key={tag} className="ft-tag-pill" onClick={() => onTagClick && onTagClick(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 whitespace-nowrap">
        {acc?.name || '-'}
      </span>
      <div
        className={`tabular-nums font-semibold text-[13.5px] ${
          tx.type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-ink-900 dark:text-ink-100'
        }`}
      >
        {sign}{fmt(tx.amount)}
      </div>
      <div className={`flex gap-0.5 ${showActions ? 'opacity-0 group-hover:opacity-100' : 'invisible'} transition`}>
        {showActions && (
          <>
            <button className="ft-icon-btn" onClick={() => onEdit(tx)} aria-label="Edit">
              <i className="ti ti-edit text-sm"></i>
            </button>
            <button className="ft-icon-btn hover:!text-red-600 dark:hover:!text-red-400" onClick={() => onDelete(tx.id)} aria-label="Delete">
              <i className="ti ti-trash text-sm"></i>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
