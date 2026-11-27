[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/brianwang1226/kitchen-table-ledger/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/brianwang1226/kitchen-table-ledger/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# The Kitchen Table Ledger

A household budget site for the Marsh family — Maya, Daniel, Lily and Noah, in
Portland, Oregon — built for the [make.fun competition](https://make.fun/bounty/best-household-budget-site-20261126-1457).

November 2026, in real numbers: $6,240.00 of income, $4,446.42 spent across 38
dated purchases, $900.00 moved to four savings goals, and $893.58 left to budget.
Every total on every page is computed from the same ledger rows, so the numbers
always agree.

## What it does

- **Overview** — income, spending, savings and what is left, a six-month
  cash-flow chart, the four budgets closest to their limit, bills still to pay,
  and the latest spending.
- **Transactions** — the full ledger of every dollar in and out, with a running
  balance, filters by category and person, search, sorting, and a form to log a
  purchase (saved in the browser). Downloadable as CSV.
- **Budgets** — the month's plan against what was spent in all eleven categories,
  with over/under for each, plus the 50/30/20 rule: needs 59.7%, wants 11.5%,
  saved 28.7%.
- **Bills** — ten recurring bills, $2,498.09 in all, with due dates, autopay
  flags, and paid toggles the site remembers.
- **Goals** — four savings goals (emergency fund, summer road trip, new car,
  Lily's braces) with progress, monthly transfers and a projected finish date,
  plus buttons to add money.
- **Reports** — spending by category as a donut chart, six months of saving as a
  line chart, who paid for what, and four written insights from the month's
  numbers — with a table under every chart.

The site is plain static files under `app/` — no network requests, no build step.
Charts are drawn on canvas from the data in `app/data.js`, and the family's own
additions are kept in the browser's localStorage, so nothing leaves the machine.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
