import { uid } from '../utils/formatters'

// First-run defaults: empty everything
export function getInitialAccounts() { return [] }
export function getInitialTransactions() { return [] }
export function getInitialBudgets() { return {} }
export function getInitialGoals() { return [] }
export function getInitialRecurring() { return [] }

export function getDefaultPresets() {
  return [
    { label: 'Coffee', type: 'expense', amount: 5, category: 'Food', note: 'Coffee' },
    { label: 'Lunch', type: 'expense', amount: 12, category: 'Food', note: 'Lunch' },
    { label: 'Gas', type: 'expense', amount: 40, category: 'Transport', note: 'Gas fill-up' },
    { label: 'Groceries', type: 'expense', amount: 75, category: 'Food', note: 'Groceries' },
  ]
}

// Helper: ISO date string for N days ago
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Helper: ISO date string N days from now (for future deadlines)
function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// Helper: pick a date in a past month (offset months back), clamped to <= today
function dateInPastMonth(monthsBack, dayOfMonth) {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth() - monthsBack, dayOfMonth)
  // Clamp to <= today (in case dayOfMonth > today.getDate() in current month)
  if (target > today) target.setTime(today.getTime() - 86400000)
  return target.toISOString().slice(0, 10)
}

export function generateDemoData() {
  const accounts = [
    { id: 'acc1', name: 'Main checking', type: 'checking', startBalance: 2500 },
    { id: 'acc2', name: 'Savings', type: 'savings', startBalance: 4800 },
    { id: 'acc3', name: 'Credit card', type: 'credit', startBalance: 0 },
    { id: 'acc4', name: 'Cash wallet', type: 'cash', startBalance: 120 },
  ]

  const txs = []
  const today = new Date()
  const todayDay = today.getDate()

  for (let m = 1; m < 6; m++) {
    txs.push({ id: uid(), type: 'income', amount: 2400, category: 'Salary', accountId: 'acc1', date: dateInPastMonth(m, 1), note: 'Monthly stipend', recurringId: 'r1', tags: [] })
    txs.push({ id: uid(), type: 'expense', amount: 850, category: 'Rent', accountId: 'acc1', date: dateInPastMonth(m, 3), note: 'Rent payment', recurringId: 'r2', tags: [] })
    txs.push({ id: uid(), type: 'expense', amount: 14.99, category: 'Subscriptions', accountId: 'acc3', date: dateInPastMonth(m, 5), note: 'Netflix', recurringId: 'r3', tags: [] })
    txs.push({ id: uid(), type: 'expense', amount: Math.round(180 + Math.random() * 120), category: 'Food', accountId: 'acc3', date: dateInPastMonth(m, 12), note: 'Groceries', tags: [] })
    txs.push({ id: uid(), type: 'expense', amount: Math.round(60 + Math.random() * 40), category: 'Transport', accountId: 'acc1', date: dateInPastMonth(m, 15), note: 'Gas', tags: [] })
    if (m < 4) txs.push({ id: uid(), type: 'income', amount: Math.round(150 + Math.random() * 250), category: 'Freelance', accountId: 'acc1', date: dateInPastMonth(m, 20), note: 'Side gig', tags: ['side-hustle'] })
    txs.push({ id: uid(), type: 'expense', amount: Math.round(40 + Math.random() * 80), category: 'Entertainment', accountId: 'acc3', date: dateInPastMonth(m, 22), note: 'Movies & dining', tags: m === 1 ? ['date-night'] : [] })
    txs.push({ id: uid(), type: 'expense', amount: Math.round(25 + Math.random() * 50), category: 'Shopping', accountId: 'acc3', date: dateInPastMonth(m, 25), note: 'Online shopping', tags: [] })
  }

  // Salary on day 1 if we're past day 1; rent on day 3 if past; etc.
  if (todayDay >= 1) txs.push({ id: uid(), type: 'income', amount: 2400, category: 'Salary', accountId: 'acc1', date: daysAgo(todayDay - 1), note: 'Monthly stipend', recurringId: 'r1', tags: [] })
  if (todayDay >= 3) txs.push({ id: uid(), type: 'expense', amount: 850, category: 'Rent', accountId: 'acc1', date: daysAgo(todayDay - 3), note: 'Rent payment', recurringId: 'r2', tags: [] })
  if (todayDay >= 5) txs.push({ id: uid(), type: 'expense', amount: 14.99, category: 'Subscriptions', accountId: 'acc3', date: daysAgo(todayDay - 5), note: 'Netflix', recurringId: 'r3', tags: [] })

  const recentTxs = [
    { offset: 1, type: 'expense', amount: 38, category: 'Food', accountId: 'acc4', note: 'Lunch with team', tags: [] },
    { offset: 2, type: 'expense', amount: 22, category: 'Transport', accountId: 'acc1', note: 'Uber', tags: [] },
    { offset: 3, type: 'expense', amount: 124, accountId: 'acc3', note: 'Costco run', tags: ['weekly-shop'],
      splits: [
        { id: uid(), category: 'Food', amount: 78 },
        { id: uid(), category: 'Household', amount: 32 },
        { id: uid(), category: 'Health', amount: 14 },
      ] },
    { offset: 4, type: 'expense', amount: 48, category: 'Transport', accountId: 'acc1', note: 'Uber to client meeting', tags: ['reimbursable', 'work'] },
    { offset: 5, type: 'expense', amount: 65, category: 'Entertainment', accountId: 'acc3', note: 'Concert tickets', tags: ['date-night'] },
    { offset: 6, type: 'income', amount: 280, category: 'Freelance', accountId: 'acc1', note: 'Side gig payment', tags: ['side-hustle'] },
  ]

  recentTxs.forEach(t => {
    if (t.offset >= todayDay) return // skip if it would push beyond the start of the month / current month
    const tx = { id: uid(), date: daysAgo(t.offset), tags: t.tags || [], note: t.note, accountId: t.accountId, amount: t.amount, type: t.type }
    if (t.splits) tx.splits = t.splits
    else tx.category = t.category
    txs.push(tx)
  })

  const budgets = { Food: 300, Transport: 150, Entertainment: 100, Shopping: 200, Subscriptions: 50 }

  const goals = [
    { id: uid(), name: 'Emergency fund', target: 5000, current: 1850, deadline: daysFromNow(240) },
    { id: uid(), name: 'Japan trip', target: 3000, current: 720, deadline: daysFromNow(330) },
  ]

  const recurring = [
    { id: 'r1', type: 'income', amount: 2400, category: 'Salary', accountId: 'acc1', note: 'Monthly stipend', frequency: 'monthly', dayOfMonth: 1, active: true },
    { id: 'r2', type: 'expense', amount: 850, category: 'Rent', accountId: 'acc1', note: 'Rent payment', frequency: 'monthly', dayOfMonth: 3, active: true },
    { id: 'r3', type: 'expense', amount: 14.99, category: 'Subscriptions', accountId: 'acc3', note: 'Netflix', frequency: 'monthly', dayOfMonth: 5, active: true },
  ]

  return { accounts, txs, budgets, goals, recurring }
}
