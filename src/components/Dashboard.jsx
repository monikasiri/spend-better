import { fmt } from '../utils/formatters'
import { expenseBreakdown, getMonthSummary, accountBalance } from '../utils/calculations'
import StatCard from './StatCard'
import CategoryPieChart from './CategoryPieChart'
import MonthlyBarChart from './MonthlyBarChart'
import NetWorthChart from './NetWorthChart'
import TransactionRow from './TransactionRow'
import EmptyState from './EmptyState'

export default function Dashboard({ monthTxs, lastMonthTxs, allTxs, accounts, budgets, currentMonth, currentYear, onSeeAll, onEditTx, onDeleteTx, onTagClick }) {
  const cur = getMonthSummary(monthTxs)
  const last = getMonthSummary(lastMonthTxs)
  const nw = accounts.reduce((s, a) => s + accountBalance(a, allTxs), 0)
  const breakdown = expenseBreakdown(monthTxs)
  const recent = [...monthTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

  // Determine if we're viewing the current month (for pacing-aware logic)
  const today = new Date()
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth
  const monthProgress = daysElapsed / daysInMonth // 0-1

  // Show vs-last-month delta only if at least 25% of month has passed (avoids "↓ 100%" on day 1)
  const showDeltas = !isCurrentMonth || monthProgress >= 0.25
  const incomeDelta = showDeltas ? computeDelta(cur.income, last.income, 'income') : { text: 'this month', kind: 'muted' }
  const expenseDelta = showDeltas ? computeDelta(cur.expense, last.expense, 'expense') : { text: 'this month', kind: 'muted' }

  const rateText = cur.savingsRate >= 20 ? 'great pace' : cur.savingsRate >= 10 ? 'on track' : cur.savingsRate >= 0 ? 'tight' : 'spending more than earning'
  const rateKind = cur.savingsRate >= 20 ? 'up' : cur.savingsRate < 0 ? 'down' : 'muted'

  const insights = computeInsights(monthTxs, lastMonthTxs, cur, breakdown, accounts, allTxs, budgets, isCurrentMonth, monthProgress)

  const hasActivity = monthTxs.length > 0
  const showNoActivityBanner = !isCurrentMonth && !hasActivity

  return (
    <div>
      {showNoActivityBanner && (
        <div className="ft-card !py-4 flex items-center gap-3 !mb-3">
          <div className="w-9 h-9 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-calendar-off text-base text-ink-500"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">No activity this month</div>
            <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">No transactions logged. Use the month nav above to switch to a month with data.</div>
          </div>
        </div>
      )}

      <div data-tour="dashboard-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          label="Net worth"
          value={fmt(nw, 0)}
          valueColor={nw >= 0 ? undefined : '#dc2626'}
          delta="across all accounts"
          deltaKind="muted"
        />
        <StatCard
          label="Income"
          value={fmt(cur.income)}
          valueColor="#059669"
          delta={incomeDelta.text}
          deltaKind={incomeDelta.kind}
        />
        <StatCard
          label="Expenses"
          value={fmt(cur.expense)}
          delta={expenseDelta.text}
          deltaKind={expenseDelta.kind}
        />
        <StatCard
          label="Savings rate"
          value={cur.savingsRate + '%'}
          valueColor={cur.savingsRate >= 20 ? '#059669' : cur.savingsRate < 0 ? '#dc2626' : undefined}
          delta={rateText}
          deltaKind={rateKind}
        />
      </div>

      <div className="ft-card">
        <h3 className="ft-section-title mb-3 flex items-center gap-1.5">
          <i className="ti ti-sparkles text-sm text-amber-500"></i> Insights
        </h3>
        <div className="space-y-1.5">
          {insights.length ? insights.map((i, idx) => (
            <div key={idx} className="flex gap-2.5 px-3 py-2.5 bg-ink-50 dark:bg-ink-800/40 rounded-lg text-[13px]">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: i.color + '22', color: i.color }}
              >
                <i className={`ti ${i.icon}`}></i>
              </div>
              <div className="flex-1 leading-relaxed">{i.text}</div>
            </div>
          )) : (
            <EmptyState icon="ti-bulb" title="No insights yet" subtitle="Add a few transactions to see analysis." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="ft-card">
          <h3 className="ft-section-title mb-4">Spending by category</h3>
          <CategoryPieChart breakdown={breakdown} />
        </div>
        <div className="ft-card">
          <h3 className="ft-section-title mb-4">
            Income vs expenses{' '}
            <span className="ft-section-meta">last 6 months</span>
          </h3>
          <MonthlyBarChart txs={allTxs} currentMonth={currentMonth} currentYear={currentYear} />
        </div>
      </div>

      <div className="ft-card">
        <h3 className="ft-section-title mb-4">
          Net worth trend{' '}
          <span className="ft-section-meta">cumulative balance</span>
        </h3>
        <NetWorthChart txs={allTxs} accounts={accounts} currentMonth={currentMonth} currentYear={currentYear} />
      </div>

      <div className="ft-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="ft-section-title">Recent activity</h3>
          <button onClick={onSeeAll} className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 font-medium">
            See all →
          </button>
        </div>
        {recent.length ? recent.map(t => (
          <TransactionRow
            key={t.id}
            tx={t}
            accounts={accounts}
            showActions={false}
            onTagClick={onTagClick}
          />
        )) : (
          <EmptyState icon="ti-receipt" title="No transactions this month" subtitle="Add one to get started." />
        )}
      </div>
    </div>
  )
}

function computeDelta(cur, prev, kind) {
  if (prev === 0) return { text: 'no prior data', kind: 'muted' }
  const diff = cur - prev
  const pct = Math.round((diff / prev) * 100)
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→'
  const text = `${arrow} ${Math.abs(pct)}% vs last month`
  const isGood = (kind === 'income' && diff >= 0) || (kind === 'expense' && diff <= 0)
  return { text, kind: Math.abs(pct) < 2 ? 'muted' : isGood ? 'up' : 'down' }
}

function computeInsights(ms, lastMs, cur, byCat, accounts, allTxs, budgets, isCurrentMonth, monthProgress) {
  const insights = []
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
  if (topCat && cur.expense > 0) {
    insights.push({
      icon: 'ti-chart-pie', color: '#7F77DD',
      text: <><strong>{topCat[0]}</strong> is your biggest expense at {fmt(topCat[1])} ({Math.round(topCat[1] / cur.expense * 100)}% of spending).</>,
    })
  }
  // Skip vs-last-month jumps when we're early in current month (would be misleading)
  if (lastMs.length && (!isCurrentMonth || monthProgress >= 0.5)) {
    const lastByCat = {}
    lastMs.filter(t => t.type === 'expense').forEach(t => {
      if (t.splits) t.splits.forEach(s => lastByCat[s.category] = (lastByCat[s.category] || 0) + s.amount)
      else lastByCat[t.category] = (lastByCat[t.category] || 0) + t.amount
    })
    let biggestJump = null
    Object.keys(byCat).forEach(c => {
      const prev = lastByCat[c] || 0
      if (prev > 20) {
        const change = ((byCat[c] - prev) / prev) * 100
        if (!biggestJump || Math.abs(change) > Math.abs(biggestJump.change)) {
          biggestJump = { cat: c, change, prev, cur: byCat[c] }
        }
      }
    })
    if (biggestJump && Math.abs(biggestJump.change) > 15) {
      const up = biggestJump.change > 0
      insights.push({
        icon: up ? 'ti-trending-up' : 'ti-trending-down',
        color: up ? '#E24B4A' : '#1D9E75',
        text: <><strong>{biggestJump.cat}</strong> spending is {up ? 'up' : 'down'} {Math.abs(Math.round(biggestJump.change))}% vs last month ({fmt(biggestJump.prev)} → {fmt(biggestJump.cur)}).</>,
      })
    }
  }
  const reimbursable = ms.filter(t => t.type === 'expense' && (t.tags || []).some(tag => /reimburs|work/i.test(tag))).reduce((s, t) => s + t.amount, 0)
  if (reimbursable > 0) {
    insights.push({
      icon: 'ti-receipt-tax', color: '#534AB7',
      text: <>You have <strong>{fmt(reimbursable)}</strong> tagged for reimbursement - submit those expenses.</>,
    })
  }
  accounts.filter(a => a.type === 'credit').forEach(a => {
    const bal = accountBalanceFromTxs(a, allTxs)
    if (bal < -500) {
      insights.push({
        icon: 'ti-credit-card', color: '#E24B4A',
        text: <><strong>{a.name}</strong> balance is {fmt(bal)}. Plan a payment soon.</>,
      })
    }
  })
  // Pacing-aware budget warnings
  Object.keys(budgets).forEach(c => {
    const used = byCat[c] || 0
    const limit = budgets[c]
    if (!limit || insights.length >= 4) return
    const pct = (used / limit) * 100
    // For current month, only warn if user is OUTPACING the month progress
    if (isCurrentMonth && monthProgress < 1) {
      const projected = (used / monthProgress)
      const projectedPct = (projected / limit) * 100
      if (pct >= 100) {
        insights.push({
          icon: 'ti-alert-triangle', color: '#dc2626',
          text: <><strong>{c}</strong> is over budget - {Math.round(pct)}% used with {Math.round((1 - monthProgress) * 100)}% of month remaining.</>,
        })
      } else if (projectedPct >= 110 && pct >= 30) {
        insights.push({
          icon: 'ti-alert-triangle', color: '#BA7517',
          text: <><strong>{c}</strong> spending is on pace to exceed budget - {Math.round(pct)}% used at day {Math.round(monthProgress * 30)} of month.</>,
        })
      }
    } else {
      // Past months: simple threshold
      if (pct >= 100) {
        insights.push({
          icon: 'ti-alert-triangle', color: '#dc2626',
          text: <><strong>{c}</strong> went over budget - {Math.round(pct)}% used.</>,
        })
      } else if (pct >= 80) {
        insights.push({
          icon: 'ti-alert-triangle', color: '#BA7517',
          text: <><strong>{c}</strong> reached {Math.round(pct)}% of budget.</>,
        })
      }
    }
  })
  if (cur.income > 0 && cur.expense > 0) {
    const rate = ((cur.income - cur.expense) / cur.income) * 100
    if (rate >= 20 && insights.length < 4) {
      insights.push({
        icon: 'ti-trophy', color: '#1D9E75',
        text: <>Saving <strong>{Math.round(rate)}%</strong> of income this month - solid pace.</>,
      })
    }
  }
  return insights.slice(0, 4)
}

function accountBalanceFromTxs(account, txs) {
  let bal = account.startBalance
  txs.filter(t => t.accountId === account.id).forEach(t => {
    if (account.type === 'credit') bal += t.type === 'expense' ? -t.amount : t.amount
    else bal += t.type === 'income' ? t.amount : -t.amount
  })
  return bal
}
