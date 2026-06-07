# Spend Better

Spend Better is a clean personal budgeting app built with React, Vite, and Tailwind CSS. Track income, expenses, budgets, and savings goals across multiple accounts with split transactions and tag-based filtering.

## Features

- **First-run onboarding** - welcome flow that lets you pick which accounts to set up before you start
- **Guided tour** - 5-step tour highlights how the app works after onboarding. Replayable from the footer.
- **Inline help tips** - small ? icons next to non-obvious features (Split, Tags, Recurring, Goals, Budgets) explain what they do.
- **Multiple accounts** - checking, savings, credit card, cash. Net worth computed across all of them. Credit cards correctly track as debt.
- **Transaction splitting** - split a single purchase across multiple categories. Charts and budgets respect the split.
- **Tags** - free-form tags on any transaction. Filter by tag, see tag-based spending breakdowns.
- **Recurring transactions** - auto-track monthly bills and salary.
- **Savings goals** - set targets with deadlines, track progress, see how much per month is needed to hit them.
- **Budgets** - monthly limits per category with warnings at 80% and 100%.
- **Smart insights** - auto-generated analysis (top category, biggest jumps, reimbursable totals, credit card debt warnings).
- **Charts** - category pie, 6-month income/expenses bar, 12-month net worth line.
- **CSV import/export** - bring in data, take it out.
- **Sample data on demand** - clean by default, but a "Load sample data" button lets you populate the app to explore features.
- **Reset all data** - wipe everything and start over from the footer link.
- **Dark mode**, **keyboard shortcuts** (1-6 for tabs, N for add transaction).
- **All data persisted locally** via localStorage. No backend, no signups.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Stack

- React 18 + Vite
- Tailwind CSS
- Chart.js + react-chartjs-2
- Tabler Icons (via CDN)
- Inter + JetBrains Mono fonts

## Project structure

```
src/
  components/        UI components (panels, modals, charts, form)
  hooks/             useLocalStorage, useDarkMode
  utils/             formatters, calculations, csv
  data/              constants, seed (empty defaults + demo generator)
  App.jsx            main orchestrator
  main.jsx           entry point
  index.css          Tailwind + custom classes
```

## Architecture notes

- **First-run flow:** The app checks `ft_onboarded` in localStorage. If missing and no accounts exist, the welcome modal renders. Users either pick suggested accounts (with editable names and starting balances) or skip to load sample data.
- **State lives in `App.jsx`** and flows down via props. Persistence is automatic via `useLocalStorage`.
- **Account balances** derive from the start balance plus all linked transactions, with credit cards using inverted math (expenses subtract from balance, payments add).
- **Split transactions** store an array of `{category, amount}` objects. The category breakdown logic checks for splits first and falls back to the single category.
- **Tags** are simple string arrays. Autocomplete suggestions come from the union of all existing tags.
- **Charts** use `react-chartjs-2` for declarative wrappers around Chart.js.

## Keyboard shortcuts

| Key | Action |
|---|---|
| 1 | Dashboard |
| 2 | Accounts |
| 3 | Transactions |
| 4 | Budgets |
| 5 | Goals |
| 6 | Recurring |
| N | Jump to add transaction |
| Esc | Close any modal |


## Recent cleanup

- Recurring templates now generate the latest due transaction without creating duplicates.
- Split transactions stay balanced when an edited amount changes.
- CSV import restores split transactions instead of flattening them into one category.
- Dashboard insights render as React content instead of injected HTML.
- New records use stronger browser-generated IDs when available.
