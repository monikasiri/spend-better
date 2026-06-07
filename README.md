# Spend Better

A personal budgeting app I built to actually keep track of where my money goes. Income, expenses, budgets, savings goals, account balances, all in one place.

It runs entirely in your browser. No accounts, no signups, no servers, nothing leaving your machine.

Built with React, Vite, and Tailwind.

## Features

**Multiple accounts.** Checking, savings, credit cards, cash. Every transaction links to an account so the balances actually mean something. Credit cards are treated as debt, so spending pulls the balance down and payments bring it back up.

**Splitting.** One purchase can hit multiple categories. A $120 Costco run might be $80 food, $30 household, $10 health. The charts and budgets respect the split, so each category only counts its own slice instead of the whole receipt.

**Tags.** Throw whatever tags you want on a transaction (vacation, reimbursable, side hustle, taxes) and filter on them later.

**Recurring transactions.** Rent, salary, subscriptions, bills. Save them once as templates instead of retyping the same thing every month. Pause or delete them from the Recurring tab whenever.

**Savings goals.** Set a target and a deadline for whatever you're saving toward and the app tracks your progress and tells you how much to put away each month.

**Monthly budgets.** Set a limit per category. The useful part is the pacing check: it doesn't just wait until you hit 100%, it notices when you're spending too fast. Burning $50 of a $100 budget by day 3 gets flagged early, because you're clearly on track to blow past it.

**Insights.** The dashboard surfaces quick observations from your data, like your biggest category, how this month compares to last, what's reimbursable, credit card debt warnings, and your savings rate. They refresh as the numbers change.

**Charts.** Three on the dashboard: spending by category this month, income vs expenses over the last 6 months, and net worth over the last 12.

**Quick add presets.** One-click buttons for the stuff you buy constantly (coffee, lunch, gas, groceries) so logging small spending isn't a chore.

**Month navigation.** Jump between months from the header. Past months show what actually happened. The current month uses the pacing logic so early spending doesn't look like a disaster.

**CSV import and export.** Pull transactions in from a CSV or dump everything out for taxes, backups, or your own records.

**Sample data.** Starts clean, but you can load sample data to poke around first. There's a reset in the footer to wipe everything and start fresh.

**Guided tour.** A short walkthrough after onboarding, replayable from the footer, plus tooltips on the trickier features like splits, tags, recurring, goals, and budgets.

**Dark mode and shortcuts.**
- `1` through `6` switch tabs
- `N` adds a transaction
- `Esc` closes a modal

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Production build

```bash
npm run build
npm run preview
```

## Stack

React, Vite, Tailwind CSS, Recharts, and LocalStorage for persistence.

## A note on your data

Spend Better doesn't connect to a bank or send anything anywhere. Everything lives in your browser's local storage. That also means clearing your browser data clears your transactions, so use the CSV export if you want a backup.
