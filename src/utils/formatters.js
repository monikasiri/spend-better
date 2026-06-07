export function uid(prefix = '') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return prefix + crypto.randomUUID()
  }
  return prefix + `${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export function fmt(n, decimals = 2) {
  const sign = n < 0 ? '-' : ''
  return sign + '$' + Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtShort(n) {
  const a = Math.abs(n)
  if (a >= 1000) return (n >= 0 ? '$' : '-$') + (a / 1000).toFixed(1) + 'k'
  return fmt(n, 0)
}

export function parseTags(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

export function inMonth(t, m, y) {
  const d = new Date(t.date)
  return d.getMonth() === m && d.getFullYear() === y
}

export function monthLabel(month, year) {
  return new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}
