import { useState, useEffect } from 'react'
import { EXPENSE_CATS, INCOME_CATS } from '../data/constants'
import { parseTags } from '../utils/formatters'
import { resizeSplits } from '../utils/splits'
import Modal from './Modal'

export default function EditTransactionModal({ tx, accounts, onClose, onSave, onEditSplits }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (tx) setForm({
      type: tx.type, note: tx.note || '', accountId: tx.accountId,
      category: tx.category || 'Other', date: tx.date,
      amount: tx.amount, tags: (tx.tags || []).join(', '),
    })
  }, [tx])

  if (!tx || !form) return null

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const set = (k, v) => {
    const next = { ...form, [k]: v }
    // If type changed, ensure category is valid for the new type
    if (k === 'type') {
      const newCats = v === 'income' ? INCOME_CATS : EXPENSE_CATS
      if (!newCats.includes(next.category)) next.category = newCats[0]
    }
    setForm(next)
  }

  const handleSave = () => {
    const nextAmount = parseFloat(form.amount) || 0
    const updates = {
      type: form.type, note: form.note, accountId: form.accountId,
      date: form.date, amount: nextAmount,
      tags: parseTags(form.tags),
    }
    if (tx.splits) updates.splits = resizeSplits(tx.splits, nextAmount)
    else updates.category = form.category
    onSave(tx.id, updates)
    onClose()
  }

  return (
    <Modal
      open={!!tx}
      onClose={onClose}
      title="Edit transaction"
      footer={
        <>
          <button onClick={onClose} className="ft-btn">Cancel</button>
          <button onClick={handleSave} className="ft-btn-primary">Save</button>
        </>
      }
    >
      <div className="space-y-2 text-sm">
        <Row label="Type">
          <select className="ft-input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </Row>
        <Row label="Description">
          <input className="ft-input" value={form.note} onChange={e => set('note', e.target.value)} />
        </Row>
        <Row label="Account">
          <select className="ft-input" value={form.accountId} onChange={e => set('accountId', e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Row>
        {tx.splits ? (
          <Row label="Categories">
            <div className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-2">
              Split across {tx.splits.length} categories
              <button onClick={() => { onClose(); onEditSplits(tx) }} className="text-xs px-2 py-0.5 rounded border border-ink-200 dark:border-ink-800">
                Edit splits
              </button>
            </div>
          </Row>
        ) : (
          <Row label="Category">
            <select className="ft-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Row>
        )}
        <Row label="Date">
          <input className="ft-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </Row>
        <Row label="Amount">
          <input className="ft-input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
        </Row>
        <Row label="Tags">
          <input className="ft-input" placeholder="comma separated" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </Row>
      </div>
    </Modal>
  )
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
      <label className="text-ink-500 dark:text-ink-400">{label}</label>
      {children}
    </div>
  )
}
