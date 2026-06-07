import { ACCOUNT_TYPES } from '../data/constants'
import { fmt } from '../utils/formatters'
import { accountBalance } from '../utils/calculations'
import EmptyState from './EmptyState'

export default function AccountsPanel({ accounts, txs, monthTxs, onAdd, onEdit }) {
  if (!accounts.length) {
    return (
      <div className="ft-card py-10 text-center">
        <div className="max-w-sm mx-auto">
          <i className="ti ti-wallet text-3xl text-ink-400 dark:text-ink-500 block mb-3"></i>
          <h3 className="text-base font-semibold mb-2">No accounts yet</h3>
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
            Add a checking, savings, credit card, or cash account to start tracking.
          </p>
          <button onClick={onAdd} className="ft-btn-primary mx-auto">
            <i className="ti ti-plus"></i>
            Add your first account
          </button>
        </div>
      </div>
    )
  }

  const totalAssets = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + accountBalance(a, txs), 0)
  const totalDebt = accounts.filter(a => a.type === 'credit').reduce((s, a) => s + accountBalance(a, txs), 0)

  const byTag = {}
  monthTxs.filter(t => t.type === 'expense').forEach(t =>
    (t.tags || []).forEach(tag => byTag[tag] = (byTag[tag] || 0) + t.amount)
  )
  const tagEntries = Object.entries(byTag).sort((a, b) => b[1] - a[1])
  const maxTag = tagEntries[0]?.[1] || 1

  return (
    <div>
      <div className="ft-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="ft-section-title">Your accounts</h3>
          <button onClick={onAdd} className="ft-btn text-xs !h-8 !px-2.5">
            <i className="ti ti-plus"></i> Add account
          </button>
        </div>

        <div className="flex justify-between py-2 pb-3 border-b border-ink-200 dark:border-ink-800 mb-2 text-sm">
          <Stat label="Assets" value={fmt(totalAssets, 0)} color="text-emerald-600 dark:text-emerald-400" />
          <Stat label="Liabilities" value={fmt(totalDebt, 0)} color="text-red-600 dark:text-red-400" />
          <Stat label="Net worth" value={fmt(totalAssets + totalDebt, 0)} />
        </div>

        {accounts.map(a => {
          const t = ACCOUNT_TYPES[a.type]
          const bal = accountBalance(a, txs)
          const balColor = a.type === 'credit'
            ? (bal === 0 ? 'text-ink-500' : 'text-red-600 dark:text-red-400')
            : (bal >= 0 ? '' : 'text-red-600 dark:text-red-400')
          const txCount = txs.filter(x => x.accountId === a.id).length
          return (
            <div
              key={a.id}
              onClick={() => onEdit(a)}
              className="grid grid-cols-[36px_1fr_auto_auto] gap-3 items-center py-3 border-b border-ink-100 dark:border-ink-800/50 last:border-0 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/30 -mx-2 px-2 rounded transition"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                style={{ background: t.color + '22', color: t.color }}
              >
                <i className={`ti ${t.icon}`}></i>
              </div>
              <div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{t.label} | {txCount} transactions</div>
              </div>
              <div className={`text-base font-semibold tabular-nums ${balColor}`}>{fmt(bal, 2)}</div>
              <i className="ti ti-edit text-ink-400"></i>
            </div>
          )
        })}
      </div>

      {tagEntries.length > 0 && (
        <div className="ft-card">
          <h3 className="ft-section-title mb-3">
            Tag breakdown{' '}
            <span className="ft-section-meta">spending grouped by tag this month</span>
          </h3>
          {tagEntries.map(([tag, amt]) => (
            <div key={tag} className="mb-2.5">
              <div className="flex justify-between text-sm mb-1">
                <span className="ft-tag-pill cursor-default">{tag}</span>
                <span className="tabular-nums font-medium">{fmt(amt)}</span>
              </div>
              <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((amt / maxTag) * 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="text-xs text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`font-medium tabular-nums ${color || ''}`}>{value}</div>
    </div>
  )
}
