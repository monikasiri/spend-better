import { uid } from './formatters'

const dayKey = date => date.toISOString().slice(0, 10)
const clampDay = (year, month, day) => Math.min(day || 1, new Date(year, month + 1, 0).getDate())

function scheduledDateFor(template, fromDate = new Date()) {
  const frequency = template.frequency || 'monthly'
  const base = new Date(fromDate)

  if (frequency === 'weekly') {
    const wanted = Number.isInteger(template.dayOfWeek) ? template.dayOfWeek : base.getDay()
    const diff = (base.getDay() - wanted + 7) % 7
    base.setDate(base.getDate() - diff)
    return base
  }

  if (frequency === 'yearly') {
    const month = Number.isInteger(template.month) ? template.month : base.getMonth()
    const date = new Date(base.getFullYear(), month, clampDay(base.getFullYear(), month, template.dayOfMonth))
    return date > fromDate ? new Date(base.getFullYear() - 1, month, clampDay(base.getFullYear() - 1, month, template.dayOfMonth)) : date
  }

  const thisMonth = new Date(base.getFullYear(), base.getMonth(), clampDay(base.getFullYear(), base.getMonth(), template.dayOfMonth))
  if (thisMonth <= fromDate) return thisMonth

  const prevMonth = base.getMonth() === 0 ? 11 : base.getMonth() - 1
  const prevYear = base.getMonth() === 0 ? base.getFullYear() - 1 : base.getFullYear()
  return new Date(prevYear, prevMonth, clampDay(prevYear, prevMonth, template.dayOfMonth))
}

function hasGeneratedTransaction(transactions, templateId, date) {
  const key = dayKey(date)
  return transactions.some(tx => tx.recurringId === templateId && tx.date === key)
}

export function createDueRecurringTransactions(templates, transactions, today = new Date()) {
  return templates
    .filter(item => item.active)
    .map(item => ({ item, date: scheduledDateFor(item, today) }))
    .filter(({ item, date }) => date <= today && !hasGeneratedTransaction(transactions, item.id, date))
    .map(({ item, date }) => ({
      id: uid('tx_'),
      recurringId: item.id,
      type: item.type,
      amount: item.amount,
      accountId: item.accountId,
      category: item.category,
      note: item.note,
      date: dayKey(date),
      tags: item.tags || [],
    }))
}
