const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { id: 'accounts', label: 'Accounts', icon: 'ti-wallet' },
  { id: 'transactions', label: 'Transactions', icon: 'ti-list' },
  { id: 'budgets', label: 'Budgets', icon: 'ti-target' },
  { id: 'goals', label: 'Goals', icon: 'ti-flag' },
  { id: 'recurring', label: 'Recurring', icon: 'ti-refresh' },
]

export default function Tabs({ active, setActive }) {
  return (
    <div data-tour="tabs" className="flex gap-1 mb-5 overflow-x-auto bg-ink-100/60 dark:bg-ink-900/60 p-1 rounded-xl border border-ink-200/70 dark:border-ink-800">
      {TABS.map(t => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-1 min-w-fit px-3 py-2 text-[13px] whitespace-nowrap rounded-lg transition flex items-center justify-center gap-1.5 font-medium ${
              isActive
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 shadow-sm'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
            }`}
          >
            <i className={`ti ${t.icon} text-sm`}></i>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { TABS }
