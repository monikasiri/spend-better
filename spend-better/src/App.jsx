import { useState, useEffect, useMemo } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDarkMode } from './hooks/useDarkMode'
import { uid } from './utils/formatters'
import { getMonthTxs } from './utils/calculations'
import { createDueRecurringTransactions } from './utils/recurring'
import {
  getInitialAccounts, getInitialTransactions, getInitialBudgets,
  getInitialGoals, getInitialRecurring, getDefaultPresets,
  generateDemoData,
} from './data/seed'

import Header from './components/Header'
import Tabs from './components/Tabs'
import Dashboard from './components/Dashboard'
import EmptyDashboard from './components/EmptyDashboard'
import AccountsPanel from './components/AccountsPanel'
import AccountModal from './components/AccountModal'
import TransactionsPanel from './components/TransactionsPanel'
import TransactionForm from './components/TransactionForm'
import EditTransactionModal from './components/EditTransactionModal'
import SplitModal from './components/SplitModal'
import BudgetsPanel from './components/BudgetsPanel'
import GoalsPanel from './components/GoalsPanel'
import RecurringPanel from './components/RecurringPanel'
import WelcomeModal from './components/WelcomeModal'
import Tour from './components/Tour'

export default function App() {
  const [accounts, setAccounts] = useLocalStorage('ft_accounts', getInitialAccounts)
  const [txs, setTxs] = useLocalStorage('ft_txs', getInitialTransactions)
  const [budgets, setBudgets] = useLocalStorage('ft_budgets', getInitialBudgets)
  const [goals, setGoals] = useLocalStorage('ft_goals', getInitialGoals)
  const [recurring, setRecurring] = useLocalStorage('ft_recurring', getInitialRecurring)
  const [presets] = useLocalStorage('ft_presets', getDefaultPresets)
  const [hasOnboarded, setHasOnboarded] = useLocalStorage('ft_onboarded', false)
  const [tourCompleted, setTourCompleted] = useLocalStorage('ft_tour_done', false)
  const [showTour, setShowTour] = useState(false)
  const [dark, setDark] = useDarkMode()

  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [activeTab, setActiveTab] = useState('dashboard')

  const [editingTx, setEditingTx] = useState(null)
  const [editingAccount, setEditingAccount] = useState(undefined)
  const [splitState, setSplitState] = useState(null)
  const [pendingSplits, setPendingSplits] = useState(null)

  const monthTxs = useMemo(() => getMonthTxs(txs, month, year), [txs, month, year])
  const lastMonth = month === 0 ? 11 : month - 1
  const lastYear = month === 0 ? year - 1 : year
  const lastMonthTxs = useMemo(() => getMonthTxs(txs, lastMonth, lastYear), [txs, lastMonth, lastYear])

  const showWelcome = !hasOnboarded && accounts.length === 0
  const isEmpty = accounts.length === 0 || txs.length === 0

  useEffect(() => {
    setTxs(current => {
      const due = createDueRecurringTransactions(recurring, current)
      return due.length ? [...current, ...due] : current
    })
  }, [recurring, setTxs])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (showWelcome) return
      const tabs = ['dashboard', 'accounts', 'transactions', 'budgets', 'goals', 'recurring']
      if (e.key === 'n' || e.key === 'N') {
        if (accounts.length === 0) return
        setActiveTab('transactions')
        setTimeout(() => document.querySelector('input[type="number"]')?.focus(), 50)
      }
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        setActiveTab(tabs[+e.key - 1])
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showWelcome, accounts.length])

  // Onboarding handlers
  const handleOnboardComplete = chosenAccounts => {
    setAccounts(chosenAccounts)
    setHasOnboarded(true)
    if (!tourCompleted) setTimeout(() => setShowTour(true), 400)
  }

  const handleLoadDemo = () => {
    const demo = generateDemoData()
    setAccounts(demo.accounts)
    setTxs(demo.txs)
    setBudgets(demo.budgets)
    setGoals(demo.goals)
    setRecurring(demo.recurring)
    setHasOnboarded(true)
    if (!tourCompleted) setTimeout(() => setShowTour(true), 400)
  }

  const handleEndTour = () => {
    setShowTour(false)
    setTourCompleted(true)
  }

  const handleRestartTour = () => {
    setActiveTab('dashboard')
    setShowTour(true)
  }

  const handleReset = () => {
    if (!confirm('Reset all data? This will delete every account, transaction, budget, goal, and recurring entry. This cannot be undone.')) return
    setAccounts([])
    setTxs([])
    setBudgets({})
    setGoals([])
    setRecurring([])
    setHasOnboarded(false)
    setTourCompleted(false)
    setActiveTab('dashboard')
  }

  // Transaction handlers
  const handleAddTx = tx => setTxs([...txs, tx])
  const handleDeleteTx = id => {
    const tx = txs.find(t => t.id === id)
    if (!tx) return
    const desc = tx.note || tx.category || 'this transaction'
    if (!confirm(`Delete "${desc}"? This cannot be undone.`)) return
    setTxs(txs.filter(t => t.id !== id))
  }
  const handleEditTx = (id, updates) => setTxs(txs.map(t => t.id === id ? { ...t, ...updates } : t))
  const handleImport = imported => setTxs([...txs, ...imported])
  const handleAddRecurring = r => setRecurring([...recurring, r])
  const handleToggleRecurring = id => setRecurring(recurring.map(r => r.id === id ? { ...r, active: !r.active } : r))
  const handleDeleteRecurring = id => {
    if (!confirm('Delete this recurring template? Transactions already created from it will remain.')) return
    setRecurring(recurring.filter(r => r.id !== id))
  }

  const handleSaveAccount = acc => {
    if (accounts.find(a => a.id === acc.id)) {
      setAccounts(accounts.map(a => a.id === acc.id ? acc : a))
    } else {
      setAccounts([...accounts, acc])
    }
  }
  const handleDeleteAccount = id => {
    const remaining = accounts.find(a => a.id !== id)
    if (!remaining) return
    setTxs(txs.map(t => t.accountId === id ? { ...t, accountId: remaining.id } : t))
    setAccounts(accounts.filter(a => a.id !== id))
  }

  const handleUsePreset = p => {
    if (!accounts.length) return
    setTxs([...txs, {
      id: uid(), type: p.type, amount: p.amount, category: p.category,
      accountId: p.accountId || accounts[0].id,
      date: new Date().toISOString().slice(0, 10),
      note: p.note, tags: [],
    }])
  }

  const handleOpenSplit = total => {
    setSplitState({ mode: 'pending', total, splits: pendingSplits })
  }

  const handleApplySplit = splits => {
    if (splitState.mode === 'edit') {
      setTxs(txs.map(t => t.id === splitState.txId ? { ...t, splits, category: undefined } : t))
    } else {
      setPendingSplits(splits)
    }
    setSplitState(null)
  }

  const handleEditSplits = tx => {
    setSplitState({ mode: 'edit', total: tx.amount, splits: tx.splits, txId: tx.id })
  }

  // Show welcome modal first if not onboarded
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
        <WelcomeModal onComplete={handleOnboardComplete} onLoadDemo={handleLoadDemo} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <Header
          month={month} year={year}
          setMonth={setMonth} setYear={setYear}
          dark={dark} setDark={setDark}
          monthTxs={monthTxs} accounts={accounts}
          onImport={handleImport}
        />

        <Tabs active={activeTab} setActive={setActiveTab} />

        {activeTab === 'dashboard' && (
          isEmpty ? (
            <EmptyDashboard
              hasAccounts={accounts.length > 0}
              onAddTransaction={() => setActiveTab(accounts.length > 0 ? 'transactions' : 'accounts')}
              onLoadDemo={handleLoadDemo}
            />
          ) : (
            <Dashboard
              monthTxs={monthTxs}
              lastMonthTxs={lastMonthTxs}
              allTxs={txs}
              accounts={accounts}
              budgets={budgets}
              currentMonth={month}
              currentYear={year}
              onSeeAll={() => setActiveTab('transactions')}
              onEditTx={setEditingTx}
              onDeleteTx={handleDeleteTx}
            />
          )
        )}

        {activeTab === 'accounts' && (
          <AccountsPanel
            accounts={accounts}
            txs={txs}
            monthTxs={monthTxs}
            onAdd={() => setEditingAccount(null)}
            onEdit={setEditingAccount}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPanel
            monthTxs={monthTxs}
            allTxs={txs}
            accounts={accounts}
            presets={presets}
            onUsePreset={handleUsePreset}
            onEditTx={setEditingTx}
            onDeleteTx={handleDeleteTx}
            formSlot={
              accounts.length ? (
                <TransactionForm
                  accounts={accounts}
                  txs={txs}
                  onAdd={handleAddTx}
                  onAddRecurring={handleAddRecurring}
                  onOpenSplit={handleOpenSplit}
                  pendingSplits={pendingSplits}
                  clearPendingSplits={() => setPendingSplits(null)}
                />
              ) : (
                <div className="ft-card text-center py-6 text-sm text-ink-500 dark:text-ink-400">
                  Add an account first from the{' '}
                  <button onClick={() => setActiveTab('accounts')} className="underline font-medium text-ink-900 dark:text-ink-100">
                    Accounts tab
                  </button>
                  {' '}before adding transactions.
                </div>
              )
            }
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsPanel
            monthTxs={monthTxs}
            budgets={budgets}
            setBudgets={setBudgets}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsPanel goals={goals} setGoals={setGoals} />
        )}

        {activeTab === 'recurring' && (
          <RecurringPanel
            recurring={recurring}
            accounts={accounts}
            onToggle={handleToggleRecurring}
            onDelete={handleDeleteRecurring}
          />
        )}

        <EditTransactionModal
          tx={editingTx}
          accounts={accounts}
          onClose={() => setEditingTx(null)}
          onSave={handleEditTx}
          onEditSplits={handleEditSplits}
        />

        <AccountModal
          account={editingAccount}
          accounts={accounts}
          onClose={() => setEditingAccount(undefined)}
          onSave={handleSaveAccount}
          onDelete={handleDeleteAccount}
        />

        {splitState && (
          <SplitModal
            open={true}
            onClose={() => setSplitState(null)}
            total={splitState.total}
            initialSplits={splitState.splits}
            isEditing={splitState.mode === 'edit'}
            onApply={handleApplySplit}
            onClear={() => {
              if (splitState.mode === 'edit') {
                setTxs(txs.map(t => t.id === splitState.txId ? { ...t, splits: undefined, category: 'Other' } : t))
              } else {
                setPendingSplits(null)
              }
            }}
          />
        )}

        <footer data-tour="reset" className="mt-8 pt-5 border-t border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-ink-400 dark:text-ink-500">
          <span className="font-mono">Press 1-6 to switch tabs | N to add transaction | all data stored locally</span>
          <div className="flex gap-4 items-center">
            <button onClick={handleRestartTour} className="hover:text-ink-900 dark:hover:text-ink-100 transition flex items-center gap-1 font-medium">
              <i className="ti ti-help-circle"></i> Show tour
            </button>
            <button onClick={handleReset} className="hover:text-red-600 dark:hover:text-red-400 transition font-medium">
              Reset all data
            </button>
          </div>
        </footer>

        {showTour && (
          <Tour onClose={handleEndTour} setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  )
}
