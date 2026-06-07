export default function EmptyDashboard({ onAddTransaction, onLoadDemo, hasAccounts }) {
  return (
    <div className="ft-card py-10 text-center">
      <div className="max-w-sm mx-auto px-4">
        <div className="w-12 h-12 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center mx-auto mb-3">
          <i className="ti ti-coin text-xl text-ink-500 dark:text-ink-400"></i>
        </div>
        <h2 className="text-base font-bold mb-1.5">Start tracking your finances</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4 leading-relaxed">
          {hasAccounts
            ? 'Add your first transaction to see your spending breakdown, charts, and insights.'
            : 'Add an account first, then log a transaction to see charts and insights.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch sm:items-center">
          <button onClick={onAddTransaction} className="ft-btn-primary justify-center whitespace-nowrap">
            <i className="ti ti-plus"></i>
            {hasAccounts ? 'Add transaction' : 'Add account'}
          </button>
          <button onClick={onLoadDemo} className="ft-btn justify-center whitespace-nowrap">
            <i className="ti ti-sparkles"></i>
            Load sample data
          </button>
        </div>
        <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-4">
          Sample data populates the app so you can explore features.
        </p>
      </div>
    </div>
  )
}
