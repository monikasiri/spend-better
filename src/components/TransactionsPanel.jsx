import { useState, useMemo } from 'react'
import { allTags } from '../utils/calculations'
import TransactionRow from './TransactionRow'
import EmptyState from './EmptyState'

export default function TransactionsPanel({ monthTxs, allTxs, accounts, onEditTx, onDeleteTx, onTagClick, presets, onUsePreset, formSlot }) {
  const [search, setSearch] = useState('')
  const [filterAccount, setFilterAccount] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const allCats = useMemo(() => {
    const s = new Set()
    allTxs.forEach(t => {
      if (t.splits) t.splits.forEach(sp => s.add(sp.category))
      else s.add(t.category)
    })
    return [...s].sort()
  }, [allTxs])
  const tags = useMemo(() => allTags(allTxs), [allTxs])

  const list = useMemo(() => {
    const q = search.toLowerCase()
    let out = monthTxs.filter(t => {
      if (filterAccount !== 'all' && t.accountId !== filterAccount) return false
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterCat !== 'all') {
        const cats = t.splits ? t.splits.map(s => s.category) : [t.category]
        if (!cats.includes(filterCat)) return false
      }
      if (filterTag !== 'all' && !(t.tags || []).includes(filterTag)) return false
      if (q) {
        const acc = accounts.find(a => a.id === t.accountId)?.name || ''
        const hay = [t.note || '', t.category || '', (t.tags || []).join(' '), acc].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    if (sortBy === 'date') out.sort((a, b) => new Date(b.date) - new Date(a.date))
    else out.sort((a, b) => b.amount - a.amount)
    return out
  }, [monthTxs, search, filterAccount, filterType, filterCat, filterTag, sortBy, accounts])

  // Build active filter chips
  const chips = []
  if (filterAccount !== 'all') chips.push({ label: 'Account: ' + (accounts.find(a => a.id === filterAccount)?.name || filterAccount), clear: () => setFilterAccount('all') })
  if (filterType !== 'all') chips.push({ label: 'Type: ' + filterType, clear: () => setFilterType('all') })
  if (filterCat !== 'all') chips.push({ label: 'Category: ' + filterCat, clear: () => setFilterCat('all') })
  if (filterTag !== 'all') chips.push({ label: 'Tag: ' + filterTag, clear: () => setFilterTag('all') })
  if (search) chips.push({ label: 'Search: ' + search, clear: () => setSearch('') })

  const clearAll = () => { setFilterAccount('all'); setFilterType('all'); setFilterCat('all'); setFilterTag('all'); setSearch('') }

  return (
    <div>
      {formSlot}

      {presets.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3 items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-500 dark:text-ink-400 mr-1">Quick add:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => onUsePreset(p)}
              className="text-[11px] px-2.5 py-1 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-full text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-100 hover:border-ink-300 dark:hover:border-ink-700 flex items-center gap-1 transition shadow-sm"
            >
              <i className="ti ti-bolt text-[10px] text-amber-500"></i>
              {p.label} | ${p.amount}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 items-center flex-wrap mb-2">
        <input
          className="ft-input flex-1 min-w-[140px]"
          type="text"
          placeholder="Search description, category, or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="ft-input" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
          <option value="all">All accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="ft-input" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="ft-input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="ft-input" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
          <option value="all">All tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="inline-flex border border-ink-200 dark:border-ink-800 rounded-md overflow-hidden h-9">
          {['date', 'amount'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 text-xs ${sortBy === s ? 'bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 font-medium' : 'text-ink-500 dark:text-ink-400'}`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {chips.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
              {c.label}
              <button onClick={c.clear}>
                <i className="ti ti-x"></i>
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="text-[11px] px-2 py-1 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800">
            Clear all
          </button>
        </div>
      )}

      <div className="ft-card">
        {list.length ? list.map(t => (
          <TransactionRow
            key={t.id}
            tx={t}
            accounts={accounts}
            onEdit={onEditTx}
            onDelete={onDeleteTx}
            onTagClick={tag => { setFilterTag(tag) }}
          />
        )) : (
          <EmptyState icon="ti-search-off" title="No matches" subtitle="Try adjusting filters." />
        )}
      </div>
    </div>
  )
}
