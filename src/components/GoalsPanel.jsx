import { useState, useEffect } from 'react'
import { fmt, uid } from '../utils/formatters'
import EmptyState from './EmptyState'
import Modal from './Modal'
import HelpTip from './HelpTip'

export default function GoalsPanel({ goals, setGoals }) {
  const [editingGoal, setEditingGoal] = useState(undefined)

  return (
    <>
      <div className="ft-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="ft-section-title flex items-center gap-1.5">
            Savings goals
            <HelpTip>
              Name a target like "Emergency fund" or "Japan trip", set how much you want to save and by when. The app calculates how much per month you need to hit it.
            </HelpTip>
          </h3>
          <button onClick={() => setEditingGoal(null)} className="ft-btn text-xs !h-8 !px-2.5">
            <i className="ti ti-plus"></i> New goal
          </button>
        </div>

        {goals.length ? goals.map(g => {
          const pct = g.target ? Math.min(100, (Math.max(0, g.current) / g.target) * 100) : 0
          const remaining = Math.max(0, g.target - g.current)
          const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null
          const isAchieved = g.current >= g.target
          // Only compute monthly needed when there's still distance, future deadline, and goal not yet hit
          const monthlyNeeded = (!isAchieved && daysLeft && daysLeft > 0 && remaining > 0)
            ? remaining / Math.max(1, daysLeft / 30)
            : null
          const color = isAchieved ? '#059669' : pct >= 50 ? '#7F77DD' : '#3b82f6'

          return (
            <div
              key={g.id}
              onClick={() => setEditingGoal(g)}
              className="py-3 border-b border-ink-100 dark:border-ink-800/50 last:border-0 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/30 -mx-2 px-2 rounded transition"
            >
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  {g.name}
                  {isAchieved && <i className="ti ti-circle-check text-emerald-600 dark:text-emerald-400"></i>}
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 tabular-nums">
                  {fmt(g.current, 0)} / {fmt(g.target, 0)}
                </div>
              </div>
              <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${Math.round(pct)}%`, background: color }}></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-ink-500 dark:text-ink-400">
                <span>
                  {isAchieved
                    ? `Goal achieved | ${fmt(g.current - g.target, 0)} over target`
                    : `${Math.round(pct)}% complete | ${fmt(remaining, 0)} to go`}
                </span>
                <span>
                  {isAchieved
                    ? 'Done'
                    : daysLeft !== null
                      ? daysLeft > 0
                        ? `${daysLeft} days left${monthlyNeeded ? ' | ' + fmt(monthlyNeeded, 0) + '/mo needed' : ''}`
                        : 'Past deadline'
                      : 'No deadline'}
                </span>
              </div>
            </div>
          )
        }) : (
          <EmptyState icon="ti-flag" title="No goals yet" subtitle="Click 'New goal' to start tracking." />
        )}
      </div>

      {editingGoal !== undefined && (
        <GoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(undefined)}
          onSave={g => setGoals(editingGoal ? goals.map(x => x.id === g.id ? g : x) : [...goals, g])}
          onDelete={id => setGoals(goals.filter(x => x.id !== id))}
        />
      )}
    </>
  )
}

function GoalModal({ goal, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ name: '', target: '', current: 0, deadline: '' })
  const isEdit = !!goal

  useEffect(() => {
    if (goal) setForm({ name: goal.name, target: goal.target, current: goal.current, deadline: goal.deadline || '' })
    else setForm({ name: '', target: '', current: 0, deadline: '' })
  }, [goal])

  const set = (k, v) => setForm({ ...form, [k]: v })

  const handleSave = () => {
    const target = parseFloat(form.target) || 0
    const current = parseFloat(form.current) || 0
    if (!form.name.trim() || !target) return
    if (isEdit) onSave({ ...goal, name: form.name, target, current, deadline: form.deadline })
    else onSave({ id: uid(), name: form.name, target, current, deadline: form.deadline })
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? 'Edit goal' : 'New savings goal'}
      footer={
        <>
          {isEdit && (
            <button onClick={() => { onDelete(goal.id); onClose() }} className="ft-btn text-red-600 dark:text-red-400">
              Delete
            </button>
          )}
          <button onClick={onClose} className="ft-btn">Cancel</button>
          <button onClick={handleSave} className="ft-btn-primary">Save</button>
        </>
      }
    >
      <div className="space-y-2 text-sm">
        <Row label="Name">
          <input className="ft-input" placeholder="e.g. Emergency fund" value={form.name} onChange={e => set('name', e.target.value)} />
        </Row>
        <Row label="Target">
          <input className="ft-input" type="number" placeholder="5000" value={form.target} onChange={e => set('target', e.target.value)} />
        </Row>
        <Row label="Saved so far">
          <input className="ft-input" type="number" value={form.current} onChange={e => set('current', e.target.value)} />
        </Row>
        <Row label="Deadline">
          <input className="ft-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
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
