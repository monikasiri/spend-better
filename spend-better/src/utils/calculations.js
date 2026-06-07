import { inMonth } from './formatters'

export function expenseBreakdown(transactions) {
  const out = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (t.splits && t.splits.length) {
      t.splits.forEach(s => { out[s.category] = (out[s.category] || 0) + s.amount })
    } else {
      out[t.category] = (out[t.category] || 0) + t.amount
    }
  })
  return out
}

export function accountBalance(account, txs) {
  if (!account) return 0
  let bal = account.startBalance
  txs.filter(t => t.accountId === account.id).forEach(t => {
    if (account.type === 'credit') {
      bal += t.type === 'expense' ? -t.amount : t.amount
    } else {
      bal += t.type === 'income' ? t.amount : -t.amount
    }
  })
  return bal
}

export function netWorth(accounts, txs) {
  return accounts.reduce((sum, a) => sum + accountBalance(a, txs), 0)
}

export function getMonthTxs(txs, month, year) {
  return txs.filter(t => inMonth(t, month, year))
}

export function getMonthSummary(monthTxs) {
  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return {
    income,
    expense,
    balance: income - expense,
    savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
  }
}

export function allTags(txs) {
  const s = new Set()
  txs.forEach(t => (t.tags || []).forEach(tag => s.add(tag)))
  return [...s].sort()
}
