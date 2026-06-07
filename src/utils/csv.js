import { uid } from './formatters'

export function parseCSVLine(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (c === ',' && !inQ) {
      out.push(cur); cur = ''
    } else cur += c
  }
  out.push(cur)
  return out
}

function encodeSplits(splits = []) {
  return splits.map(s => `${s.category}:${s.amount}`).join(';')
}

function decodeSplits(value) {
  if (!value || !value.includes(':')) return null

  const splits = value.split(';').map(part => {
    const [category, rawAmount] = part.split(':')
    const amount = parseFloat(rawAmount)
    if (!category?.trim() || isNaN(amount)) return null
    return { id: uid('split_'), category: category.trim(), amount }
  }).filter(Boolean)

  return splits.length ? splits : null
}

export function exportToCSV(monthTxs, accounts, monthLabelStr) {
  const rows = [['Date', 'Type', 'Account', 'Category', 'Description', 'Amount', 'Tags', 'Recurring', 'Split']]
  monthTxs.forEach(t => {
    const acc = accounts.find(a => a.id === t.accountId)?.name || ''
    const cat = t.splits ? encodeSplits(t.splits) : t.category
    rows.push([
      t.date, t.type, acc, cat, t.note || '', t.amount,
      (t.tags || []).join(';'), t.recurringId ? 'yes' : 'no', t.splits ? 'yes' : 'no',
    ])
  })
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-${monthLabelStr.replace(' ', '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromCSV(file, accounts) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const lines = ev.target.result.split('\n').filter(l => l.trim())
        const imported = []
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i])
          if (cells.length < 6 || !accounts.length) continue

          const amt = parseFloat(cells[5])
          if (isNaN(amt) || amt <= 0) continue

          const accName = cells[2]
          const acc = accounts.find(a => a.name.toLowerCase() === accName.toLowerCase()) || accounts[0]
          const splitRows = cells[8]?.toLowerCase() === 'yes' ? decodeSplits(cells[3]) : null
          const tx = {
            id: uid('tx_'),
            date: cells[0],
            type: cells[1] === 'income' ? 'income' : 'expense',
            accountId: acc.id,
            note: cells[4],
            amount: amt,
            tags: cells[6] ? cells[6].split(';').map(t => t.trim()).filter(Boolean) : [],
          }

          if (splitRows) tx.splits = splitRows
          else tx.category = cells[3]

          imported.push(tx)
        }
        resolve(imported)
      } catch (e) { reject(e) }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
