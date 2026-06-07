import { useState, useEffect } from 'react'
import { ACCOUNT_TYPES } from '../data/constants'
import { uid } from '../utils/formatters'
import Modal from './Modal'

export default function AccountModal({ account, accounts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (account !== undefined) {
      setForm(account || { name: '', type: 'checking', startBalance: 0 })
    }
  }, [account])

  if (account === undefined || !form) return null

  const isEdit = !!account?.id
  const set = (k, v) => setForm({ ...form, [k]: v })

  const handleSave = () => {
    if (!form.name.trim()) return
    if (isEdit) onSave({ ...account, ...form, startBalance: parseFloat(form.startBalance) || 0 })
    else onSave({ id: uid('acc_'), ...form, startBalance: parseFloat(form.startBalance) || 0 })
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? 'Edit account' : 'New account'}
      footer={
        <>
          {isEdit && accounts.length > 1 && (
            <button
              onClick={() => {
                if (confirm('Delete this account? Transactions will be reassigned to another account.')) {
                  onDelete(account.id); onClose()
                }
              }}
              className="ft-btn text-red-600 dark:text-red-400"
            >Delete</button>
          )}
          <button onClick={onClose} className="ft-btn">Cancel</button>
          <button onClick={handleSave} className="ft-btn-primary">Save</button>
        </>
      }
    >
      <div className="space-y-2 text-sm">
        <Row label="Name">
          <input className="ft-input" placeholder="e.g. Main checking" value={form.name} onChange={e => set('name', e.target.value)} />
        </Row>
        <Row label="Type">
          <select className="ft-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {Object.keys(ACCOUNT_TYPES).map(t => (
              <option key={t} value={t}>{ACCOUNT_TYPES[t].label}</option>
            ))}
          </select>
        </Row>
        <Row label="Starting balance">
          <input className="ft-input" type="number" step="0.01" value={form.startBalance} onChange={e => set('startBalance', e.target.value)} />
        </Row>
        <p className="text-[11px] text-ink-500 dark:text-ink-400 pl-[108px]">
          For credit cards, enter 0 if you have no current debt. The balance will go negative as you spend.
        </p>
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
