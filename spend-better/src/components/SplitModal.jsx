import { useState, useEffect } from 'react'
import { EXPENSE_CATS } from '../data/constants'
import { fmt, uid } from '../utils/formatters'
import Modal from './Modal'

export default function SplitModal({ open, onClose, total, initialSplits, onApply, onClear, isEditing }) {
  const [splits, setSplits] = useState([])

  useEffect(() => {
    if (open) {
      setSplits(initialSplits && initialSplits.length
        ? initialSplits.map(s => ({ ...s }))
        : [
            { category: 'Food', amount: total ? total / 2 : 0 },
            { category: 'Other', amount: total ? total / 2 : 0 },
          ]
      )
    }
  }, [open, total, initialSplits])

  if (!open) return null

  const sum = splits.reduce((s, x) => s + (x.amount || 0), 0)
  const remaining = total - sum
  const valid = Math.abs(remaining) < 0.01

  const updateSplit = (i, field, value) => {
    setSplits(splits.map((s, idx) => idx === i ? { ...s, [field]: field === 'amount' ? (parseFloat(value) || 0) : value } : s))
  }

  const removeSplit = i => setSplits(splits.filter((_, idx) => idx !== i))
  const addSplit = () => setSplits([...splits, { category: 'Other', amount: 0 }])
  const distributeEvenly = () => {
    const each = Math.round((total / splits.length) * 100) / 100
    const newSplits = splits.map(s => ({ ...s, amount: each }))
    newSplits[0].amount = Math.round((total - each * (splits.length - 1)) * 100) / 100
    setSplits(newSplits)
  }

  const handleApply = () => {
    if (!valid) { alert('Splits must sum to total'); return }
    onApply(splits.map(s => ({ id: uid(), category: s.category, amount: s.amount })))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Split transaction"
      footer={
        <>
          <button onClick={() => { onClear(); onClose() }} className="ft-btn text-red-600 dark:text-red-400">
            Remove split
          </button>
          <button onClick={onClose} className="ft-btn">Cancel</button>
          <button onClick={handleApply} className="ft-btn-primary" disabled={!valid}>
            Apply
          </button>
        </>
      }
    >
      <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
        Distribute the total {fmt(total)} across categories.
      </p>
      <div className="space-y-1.5 mb-2">
        {splits.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_30px] gap-1.5 items-center text-sm">
            <select className="ft-input" value={s.category} onChange={e => updateSplit(i, 'category', e.target.value)}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              className="ft-input"
              type="number"
              step="0.01"
              value={s.amount}
              onChange={e => updateSplit(i, 'amount', e.target.value)}
            />
            <button onClick={() => removeSplit(i)} className="ft-icon-btn">
              <i className="ti ti-x"></i>
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={addSplit} className="text-xs px-2.5 py-1 rounded border border-ink-200 dark:border-ink-800 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1">
          <i className="ti ti-plus"></i> Add line
        </button>
        <button onClick={distributeEvenly} className="text-xs px-2.5 py-1 rounded border border-ink-200 dark:border-ink-800 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1">
          <i className="ti ti-equal"></i> Distribute evenly
        </button>
      </div>
      <div className={`px-3 py-2 rounded-md text-xs flex justify-between ${valid ? 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
        <span>Total: {fmt(total)}</span>
        <span>
          Splits: {fmt(sum)}{' '}
          {valid ? <i className="ti ti-check"></i> : `(${fmt(remaining)} remaining)`}
        </span>
      </div>
    </Modal>
  )
}
