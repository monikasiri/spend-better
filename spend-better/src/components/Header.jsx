import { monthLabel } from '../utils/formatters'
import { exportToCSV, importFromCSV } from '../utils/csv'

export default function Header({ month, year, setMonth, setYear, dark, setDark, monthTxs, accounts, onImport }) {
  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }
  const goToday = () => {
    const now = new Date()
    setMonth(now.getMonth())
    setYear(now.getFullYear())
  }

  const handleImport = () => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = '.csv'
    inp.onchange = async e => {
      const file = e.target.files[0]
      if (!file) return
      try {
        const imported = await importFromCSV(file, accounts)
        if (imported.length) {
          onImport(imported)
          alert(`Imported ${imported.length} transactions`)
        }
      } catch (err) { alert('Import failed: ' + err.message) }
    }
    inp.click()
  }

  return (
    <div data-tour="header" className="flex items-center justify-between gap-3 mb-5 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-ink-900 dark:bg-ink-100 flex items-center justify-center shadow-sm">
          <i className="ti ti-coin text-white dark:text-ink-900 text-lg"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-none">Spend Better</h1>
          <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 font-medium">Track your money, simply.</p>
        </div>
      </div>

      <div className="flex gap-1.5 items-center flex-wrap">
        <div className="flex items-center gap-0.5 border border-ink-200 dark:border-ink-800 rounded-lg p-0.5 bg-white dark:bg-ink-900 shadow-sm">
          <button onClick={goPrev} className="p-1.5 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 transition" aria-label="Previous">
            <i className="ti ti-chevron-left text-base"></i>
          </button>
          <span className="text-sm font-semibold tabular-nums min-w-[110px] text-center px-1">{monthLabel(month, year)}</span>
          <button onClick={goNext} className="p-1.5 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 transition" aria-label="Next">
            <i className="ti ti-chevron-right text-base"></i>
          </button>
          <button onClick={goToday} className="text-[11px] px-2 py-1 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 font-semibold transition uppercase tracking-wider text-ink-600 dark:text-ink-400">Today</button>
        </div>
        <button onClick={handleImport} className="ft-btn !px-2.5" title="Import CSV">
          <i className="ti ti-upload text-base"></i>
        </button>
        <button onClick={() => exportToCSV(monthTxs, accounts, monthLabel(month, year))} className="ft-btn !px-2.5" title="Export CSV">
          <i className="ti ti-download text-base"></i>
        </button>
        <button onClick={() => setDark(!dark)} className="ft-btn !px-2.5" title="Toggle theme">
          <i className={`ti ${dark ? 'ti-sun' : 'ti-moon'} text-base`}></i>
        </button>
      </div>
    </div>
  )
}
