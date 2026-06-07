import { EXPENSE_CATS, CAT_ICONS, CAT_COLORS } from '../data/constants'
import { fmt } from '../utils/formatters'
import { expenseBreakdown } from '../utils/calculations'
import HelpTip from './HelpTip'

export default function BudgetsPanel({ monthTxs, budgets, setBudgets }) {
  const spent = expenseBreakdown(monthTxs)
  const hasAnyBudget = Object.keys(budgets).length > 0

  const updateBudget = (cat, val) => {
    const v = parseFloat(val) || 0
    const next = { ...budgets }
    if (v > 0) next[cat] = v
    else delete next[cat]
    setBudgets(next)
  }

  return (
    <div className="ft-card">
      <h3 className="ft-section-title mb-1.5 flex items-center gap-1.5">
        Monthly budgets <span className="ft-section-meta">limits per category</span>
        <HelpTip>
          Set a monthly cap for any category. The bar fills as you spend. Yellow at 80% used, red when you hit the limit. Leave at 0 to skip a category.
        </HelpTip>
      </h3>
      <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
        {hasAnyBudget
          ? 'Yellow at 80% used, red when you hit the cap.'
          : 'Set a monthly limit for any category. Type an amount to start tracking it.'}
      </p>

      {EXPENSE_CATS.map(c => {
        const limit = budgets[c] || 0
        const used = spent[c] || 0
        const pct = limit ? Math.min(100, (used / limit) * 100) : 0
        const overPct = limit ? (used / limit) * 100 : 0
        const fillColor = overPct >= 100 ? '#dc2626' : overPct >= 80 ? '#d97706' : '#059669'
        const status = limit && overPct >= 100
          ? <span className="text-[11px] text-red-600 dark:text-red-400">Over by {fmt(used - limit)}</span>
          : limit && overPct >= 80
          ? <span className="text-[11px] text-amber-600 dark:text-amber-400">{Math.round(overPct)}% used</span>
          : limit
          ? <span className="text-[11px] text-ink-500 dark:text-ink-400">{Math.round(overPct)}% used</span>
          : <span className="text-[11px] text-ink-400 dark:text-ink-500">No limit</span>

        return (
          <div key={c} className="py-3 border-b border-ink-100 dark:border-ink-800/50 last:border-0">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <i className={`ti ${CAT_ICONS[c] || 'ti-dots'}`} style={{ color: CAT_COLORS[c] || '#888780' }}></i>
                <span className="text-sm font-medium">{c}</span>
                {status}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400 tabular-nums">
                <span>{fmt(used, 0)}</span>
                <span className="text-ink-400 dark:text-ink-500">/</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={limit || ''}
                  placeholder="0"
                  onChange={e => updateBudget(c, e.target.value)}
                  className="ft-input w-20 h-7 text-xs"
                />
              </div>
            </div>
            <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${Math.round(pct)}%`, background: fillColor }}></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
