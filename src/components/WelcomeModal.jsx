import { useState } from 'react'
import { ACCOUNT_TYPES } from '../data/constants'
import { uid } from '../utils/formatters'

const SUGGESTED_ACCOUNTS = [
  { name: 'Main checking', type: 'checking', startBalance: 0 },
  { name: 'Savings', type: 'savings', startBalance: 0 },
  { name: 'Credit card', type: 'credit', startBalance: 0 },
  { name: 'Cash', type: 'cash', startBalance: 0 },
]

export default function WelcomeModal({ onComplete, onLoadDemo }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState({ 0: true })
  const [customAccounts, setCustomAccounts] = useState(SUGGESTED_ACCOUNTS.map(a => ({ ...a })))

  const updateAccount = (i, field, value) => {
    const next = [...customAccounts]
    next[i] = { ...next[i], [field]: field === 'startBalance' ? value : value }
    setCustomAccounts(next)
  }

  const handleFinish = () => {
    const chosen = customAccounts
      .filter((_, i) => selected[i])
      .map(a => ({
        id: 'acc' + uid(),
        name: a.name.trim() || 'Account',
        type: a.type,
        startBalance: parseFloat(a.startBalance) || 0,
      }))
    if (!chosen.length) return
    onComplete(chosen)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-ink-900 rounded-xl w-full max-w-lg border border-ink-200 dark:border-ink-800 shadow-2xl overflow-hidden">
        {step === 1 && (
          <>
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-ink-900 dark:bg-ink-100 flex items-center justify-center">
                  <i className="ti ti-coin text-white dark:text-ink-900 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Welcome to Spend Better</h2>
                  <p className="text-xs text-ink-500 dark:text-ink-400">Track your money, simply.</p>
                </div>
              </div>

              <p className="text-sm text-ink-600 dark:text-ink-300 mb-4 leading-relaxed">
                Pick the accounts you want to track. You can add or remove these anytime.
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {customAccounts.map((acc, i) => {
                  const t = ACCOUNT_TYPES[acc.type]
                  const isSelected = !!selected[i]
                  return (
                    <div
                      key={i}
                      className={`border rounded-lg p-3 transition cursor-pointer ${
                        isSelected
                          ? 'border-ink-900 dark:border-ink-100 bg-ink-50 dark:bg-ink-800/50'
                          : 'border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700'
                      }`}
                      onClick={() => setSelected({ ...selected, [i]: !isSelected })}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: t.color + '22', color: t.color }}
                        >
                          <i className={`ti ${t.icon}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          {isSelected ? (
                            <input
                              type="text"
                              value={acc.name}
                              onChange={e => updateAccount(i, 'name', e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="text-sm font-medium bg-transparent outline-none border-b border-ink-200 dark:border-ink-700 focus:border-ink-900 dark:focus:border-ink-100 w-full"
                            />
                          ) : (
                            <div className="text-sm font-medium">{acc.name}</div>
                          )}
                          <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{t.label}</div>
                        </div>
                        {isSelected && (
                          <div onClick={e => e.stopPropagation()} className="flex items-center gap-1.5">
                            <span className="text-xs text-ink-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={acc.startBalance}
                              onChange={e => updateAccount(i, 'startBalance', e.target.value)}
                              className="w-24 text-sm tabular-nums bg-transparent outline-none border-b border-ink-200 dark:border-ink-700 focus:border-ink-900 dark:focus:border-ink-100 text-right"
                            />
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-ink-900 dark:bg-ink-100'
                            : 'border border-ink-300 dark:border-ink-700'
                        }`}>
                          {isSelected && <i className="ti ti-check text-white dark:text-ink-900 text-xs"></i>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-3 leading-relaxed">
                Tip: enter your <strong className="text-ink-700 dark:text-ink-200">current actual balance</strong> for each account so net worth math works correctly. For credit cards, leave at 0 if you have no debt - it'll go negative as you spend.
              </p>
            </div>

            <div className="border-t border-ink-200 dark:border-ink-800 p-4 flex justify-between items-center bg-ink-50 dark:bg-ink-950/50">
              <button
                onClick={onLoadDemo}
                className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 underline-offset-2 hover:underline"
              >
                Skip and load sample data
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!Object.values(selected).some(v => v)}
                className="ft-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <i className="ti ti-check text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">You're ready</h2>
                  <p className="text-xs text-ink-500 dark:text-ink-400">A few quick tips.</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-2">
                <Tip icon="ti-plus" title="Add transactions" desc="Hit the Transactions tab or press N anywhere." />
                <Tip icon="ti-target" title="Set monthly budgets" desc="Cap categories like Food and get alerts when you're close." />
                <Tip icon="ti-flag" title="Track savings goals" desc="Name a target, set a deadline, watch progress build." />
                <Tip icon="ti-refresh" title="Recurring bills" desc="Mark salary or rent as recurring so you don't have to retype." />
                <Tip icon="ti-arrows-split-2" title="Split purchases" desc="One Costco run can count as Food, Household, and Health." />
              </div>
            </div>

            <div className="border-t border-ink-200 dark:border-ink-800 p-4 flex justify-between items-center bg-ink-50 dark:bg-ink-950/50">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 flex items-center gap-1"
              >
                <i className="ti ti-arrow-left"></i> Back
              </button>
              <button onClick={handleFinish} className="ft-btn-primary">
                Get started
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Tip({ icon, title, desc }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-md bg-ink-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i className={`ti ${icon} text-sm text-ink-600 dark:text-ink-300`}></i>
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}
