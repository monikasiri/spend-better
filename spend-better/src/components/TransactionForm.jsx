import { useState, useMemo } from 'react'
import { EXPENSE_CATS, INCOME_CATS } from '../data/constants'
import { uid, parseTags } from '../utils/formatters'
import { allTags } from '../utils/calculations'
import HelpTip from './HelpTip'

export default function TransactionForm({ accounts, txs, onAdd, onOpenSplit, pendingSplits, clearPendingSplits, onAddRecurring }) {
  const [type, setType] = useState('expense')
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [tags, setTags] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('monthly')

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const existingTags = useMemo(() => allTags(txs), [txs])
  const usedTags = parseTags(tags).map(t => t.toLowerCase())
  const tagSuggestions = existingTags.filter(t => !usedTags.includes(t.toLowerCase())).slice(0, 5)

  // Keep category in sync with type
  const handleTypeChange = (newType) => {
    setType(newType)
    const newCats = newType === 'income' ? INCOME_CATS : EXPENSE_CATS
    if (!newCats.includes(category)) setCategory(newCats[0])
  }

  const handleAdd = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    const tx = {
      id: uid('tx_'), type, amount: amt, accountId,
      date: date || new Date().toISOString().slice(0, 10),
      note, tags: parseTags(tags),
    }
    if (pendingSplits && pendingSplits.length) {
      tx.splits = pendingSplits.map(s => ({ id: uid('split_'), category: s.category, amount: s.amount }))
    } else {
      tx.category = category
    }
    if (recurring && !tx.splits) {
      const recId = uid('rec_')
      tx.recurringId = recId
      onAddRecurring({
        id: recId, type, amount: amt, category, accountId,
        note, frequency: recurringFreq, dayOfMonth: new Date(tx.date).getDate(), dayOfWeek: new Date(tx.date).getDay(), month: new Date(tx.date).getMonth(), active: true,
      })
    }
    onAdd(tx)
    setAmount(''); setNote(''); setTags('')
    setRecurring(false)
    clearPendingSplits()
  }

  const handleKey = e => {
    if (e.key === 'Enter') handleAdd()
  }

  const addTag = (tag) => {
    const cur = tags.trim()
    setTags((cur && !cur.endsWith(',') ? cur + ', ' : cur) + tag)
  }

  return (
    <div data-tour="add-tx" className="ft-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="ft-section-title flex items-center gap-1.5">
          <i className="ti ti-plus text-sm"></i> Add transaction
        </h3>
        <span className="text-[10px] px-1.5 py-0.5 border border-ink-200 dark:border-ink-800 rounded-md text-ink-400 dark:text-ink-500 font-mono bg-ink-50 dark:bg-ink-950/50">N</span>
      </div>

      {/* Type toggle */}
      <div className="inline-flex border border-ink-200 dark:border-ink-800 rounded-lg p-0.5 mb-3 bg-ink-50 dark:bg-ink-950/50">
        <button
          onClick={() => handleTypeChange('expense')}
          className={`px-3.5 py-1 text-[12.5px] rounded-md font-medium transition flex items-center gap-1.5 ${
            type === 'expense'
              ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 shadow-sm'
              : 'text-ink-500 dark:text-ink-400'
          }`}
        >
          <i className="ti ti-arrow-down text-xs"></i> Expense
        </button>
        <button
          onClick={() => handleTypeChange('income')}
          className={`px-3.5 py-1 text-[12.5px] rounded-md font-medium transition flex items-center gap-1.5 ${
            type === 'income'
              ? 'bg-white dark:bg-ink-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-ink-500 dark:text-ink-400'
          }`}
        >
          <i className="ti ti-arrow-up text-xs"></i> Income
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
        <div className="sm:col-span-5">
          <Label>Description</Label>
          <input className="ft-input w-full" type="text" placeholder="What's this for?" value={note} onChange={e => setNote(e.target.value)} onKeyDown={handleKey} />
        </div>
        <div className="sm:col-span-3">
          <Label>Account</Label>
          <select className="ft-input w-full" value={accountId} onChange={e => setAccountId(e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-4">
          <Label>Category</Label>
          <select className="ft-input w-full" value={category} onChange={e => setCategory(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-4">
          <Label>Date</Label>
          <input className="ft-input w-full" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <Label>Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500 text-sm">$</span>
            <input className="ft-input w-full pl-7" type="number" placeholder="0.00" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={handleKey} />
          </div>
        </div>
        <div className="sm:col-span-4 flex items-end">
          <button onClick={handleAdd} className="ft-btn-primary w-full justify-center h-9">
            <i className="ti ti-plus"></i>
            Add
          </button>
        </div>
      </div>

      {/* Tags row */}
      <div className="mb-3">
        <Label>
          <span className="flex items-center gap-1">
            Tags <HelpTip>Free-form labels like "vacation" or "reimbursable". Filter the transaction list by tag to see related spending grouped together.</HelpTip>
          </span>
        </Label>
        <div className="flex gap-2 items-start flex-wrap">
          <input
            className="ft-input flex-1 min-w-[160px] h-9"
            type="text"
            placeholder="Add tags, separated by commas"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          {tagSuggestions.length > 0 && (
            <div className="flex gap-1 flex-wrap items-center pt-1.5">
              {tagSuggestions.map(t => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="text-[11px] px-2 py-0.5 bg-ink-100 dark:bg-ink-800 rounded-full text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 transition"
                >
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Options row */}
      <div className="flex items-center gap-3 pt-3 border-t border-ink-100 dark:border-ink-800/50 text-[12px] text-ink-600 dark:text-ink-300 flex-wrap">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-ink-900 dark:hover:text-ink-100 transition">
          <input type="checkbox" className="accent-ink-900 dark:accent-ink-100" checked={recurring} onChange={e => setRecurring(e.target.checked)} />
          <span>Make recurring</span>
        </label>
        {recurring && (
          <select
            className="ft-input h-7 text-xs px-2"
            value={recurringFreq}
            onChange={e => setRecurringFreq(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
        <HelpTip>Recurring transactions are saved as templates so you can reuse them. Useful for rent, salary, or subscriptions you don't want to retype.</HelpTip>

        <button
          onClick={() => onOpenSplit(parseFloat(amount) || 0)}
          className={`ml-auto text-[12px] px-3 py-1.5 rounded-md border transition flex items-center gap-1.5 font-medium ${
            pendingSplits
              ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
              : 'border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300'
          }`}
        >
          <i className="ti ti-arrows-split-2"></i>
          {pendingSplits ? `${pendingSplits.length} splits applied` : 'Split into categories'}
        </button>
        <HelpTip>Split a single transaction across multiple categories. A $120 Costco run might be $80 Food + $30 Household + $10 Health.</HelpTip>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">{children}</label>
}
