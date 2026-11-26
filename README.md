# Hearth & Ledger

[![make.fun competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![make.fun rank](https://make.fun/badge/best-household-budget-site-20261126-1457/vansouthrace/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![make.fun reward](https://make.fun/badge/best-household-budget-site-20261126-1457/vansouthrace/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A [make.fun](https://make.fun/bounty/best-household-budget-site-20261126-1457) entry for "Make the best household budget site": the budget of the Alvarez household for November 2025 — budgets, expenses, savings goals and calculators, with real figures in place and every control working. Static files only: no build step, no network requests, no libraries.

## The site

- **Dashboard** — income $5,850, spent $4,225, savings rate 14%, a spending donut by category, six months of spending bars, the latest expenses and the savings goals.
- **Budgets** — ten envelopes with progress bars, amounts left, and the month's bills with due dates and status.
- **Expenses** — all 20 November expenses with a category filter, an add-expense form (the matching budget bar moves), and delete buttons.
- **Savings goals** — four goals with progress bars; Add $50 / Add $100 buttons and custom amounts that move the bar, plus a form to start a new goal.
- **Calculators** — a live 50/30/20 income split and a save-for-a-goal calculator (target, already saved, months → monthly amount), both updating as you type.
- **About** — where the money comes from, how the household budgets, and the household itself.

Screenshots in `screenshots/` are real renders of the site in headless Chrome: the dashboard (cover), the budgets page, and the expenses page at phone size (390×844).

Every control works: the nav, the expense filter, add/delete expense, goal buttons and forms, and both calculators. The layout is responsive down to a phone. Changes live in the browser for the visit; nothing is sent anywhere.

## Run it

Serve `app/` with any static server and open it in a browser:

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored `vendor/makefun-frontend.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
