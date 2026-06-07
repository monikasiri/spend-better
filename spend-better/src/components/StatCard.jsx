export default function StatCard({ label, value, valueColor, delta, deltaKind }) {
  const deltaClass = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    muted: 'text-ink-500 dark:text-ink-400',
  }[deltaKind || 'muted']

  return (
    <div className="bg-white dark:bg-ink-900 border border-ink-200/70 dark:border-ink-800 rounded-xl p-4 shadow-sm hover:border-ink-300 dark:hover:border-ink-700 transition">
      <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 mb-2 uppercase tracking-[0.08em]">{label}</div>
      <div className="text-[24px] font-bold tabular-nums leading-none mb-1.5 tracking-tight" style={{ color: valueColor }}>
        {value}
      </div>
      <div className={`text-[11px] tabular-nums font-medium ${deltaClass}`}>
        {delta}
      </div>
    </div>
  )
}
