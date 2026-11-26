// Page views for Hearth & Ledger. Each view returns HTML for the main content
// area; views with controls also get a bind() step that wires the form and
// button handlers after the HTML is in the page, and a draw() step that paints
// the canvases. Edits (a new expense, money added to a goal) change the live
// lists in this module and re-render the current page, so every control does
// what it says.

import {
  HOUSEHOLD,
  INCOME,
  MONTHS,
  CATEGORIES,
  EXPENSES,
  GOALS,
  BILLS,
  totalIncome,
  totalBudget,
  totalSpent,
  money,
  moneyCents,
  fiftyThirtyTwenty,
} from './data.js';
import { drawBarChart, drawDonut, legendHTML, progressBarHTML } from './charts.js';

// Live lists: copies of the shipped figures, so adding or deleting an entry
// changes what the pages show without touching the shipped data.
export let expenses = EXPENSES.map((e) => ({ ...e }));
export let goals = GOALS.map((g) => ({ ...g }));
export let categories = CATEGORIES.map((c) => ({ ...c }));

let rerender = () => {};
export function setRerender(fn) {
  rerender = fn;
}

function kpiCard(value, label, note) {
  return `<div class="kpi"><div class="kpi-value">${value}</div><div class="kpi-label">${label}</div><div class="kpi-note">${note}</div></div>`;
}

function section(title, intro, inner) {
  return `<section class="card"><h2>${title}</h2>${intro ? `<p class="intro">${intro}</p>` : ''}${inner}</section>`;
}

function chartCard(title, canvasId, height, note) {
  return `<div class="chart-block"><h3>${title}</h3><canvas id="${canvasId}" style="height:${height}px"></canvas>${note ? `<p class="chart-note">${note}</p>` : ''}</div>`;
}

function expenseRows(entries) {
  // entries are { expense, index } pairs: index is the position in the live
  // list, so Delete removes the right row even while a filter is on.
  return entries
    .map(
      ({ expense: e, index: i }) =>
        `<tr><td>${e.date}</td><td>${e.merchant}</td><td>${e.category}</td><td class="num">${moneyCents(e.amount)}</td><td><button class="delete-btn" data-index="${i}" aria-label="Delete ${e.merchant}">Delete</button></td></tr>`,
    )
    .join('');
}

function indexedExpenses() {
  return expenses.map((e, i) => ({ expense: e, index: i }));
}

export function dashboardView() {
  const income = totalIncome();
  const spent = totalSpent();
  const left = income - spent;
  const savingsRate = Math.round((categories.find((c) => c.name === 'Savings').spent / income) * 100);
  const recent = expenses.slice(0, 5);
  const goalCards = goals
    .map(
      (g) =>
        `<li><strong>${g.name}</strong> — ${money(g.saved)} of ${money(g.target)} (${Math.round((g.saved / g.target) * 100)}%)${progressBarHTML(g.saved, g.target, g.name)}</li>`,
    )
    .join('');
  return `
  <h1>${HOUSEHOLD.month} at a glance</h1>
  <p class="lede">${HOUSEHOLD.name} — ${HOUSEHOLD.members}. Four people, one income of ${money(income)} a month, and every dollar given a job before the month begins.</p>
  <div class="kpi-grid">
    ${kpiCard(money(income), 'Income this month', 'salaries + call-outs + refunds')}
    ${kpiCard(money(spent), 'Spent & saved', 'of a ' + money(totalBudget()) + ' budget')}
    ${kpiCard(money(left), 'Left to spend', 'unbudgeted cushion for the month')}
    ${kpiCard(savingsRate + '%', 'Savings rate', money(categories.find((c) => c.name === 'Savings').spent) + ' moved to savings')}
  </div>
  <div class="two-col">
    ${section('Where the money went', 'Housing is the biggest slice, as in most households. Savings is counted here too — it is money with a job, not money left over.', chartCard('November spending by category', 'dash-donut', 250, ''))}
    ${section('Spending, last six months', 'November is the cheapest month so far — no car repair and no school fees landed in it.', chartCard('Total spent per month', 'dash-bars', 250, 'Includes the monthly savings transfer.'))}
  </div>
  <div class="two-col">
    ${section('Latest expenses', '', `<div class="table-wrap"><table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead><tbody>${recent.map((e) => `<tr><td>${e.date}</td><td>${e.merchant}</td><td>${e.category}</td><td class="num">${moneyCents(e.amount)}</td></tr>`).join('')}</tbody></table></div><p><a href="#/expenses">See all expenses &rarr;</a></p>`)}
    ${section('Savings goals', '', `<ul class="facts">${goalCards}</ul><p><a href="#/goals">Manage goals &rarr;</a></p>`)}
  </div>`;
}

export function dashboardDraw() {
  const canvas = document.getElementById('dash-donut');
  drawDonut(canvas, categories.map((c) => ({ label: c.name, value: c.spent })), { center: money(totalSpent()), centerSub: 'spent in November' });
  const block = canvas.closest('.chart-block');
  if (!block.querySelector('.legend')) {
    block.insertAdjacentHTML('beforeend', legendHTML(categories.map((c) => ({ label: c.name, value: money(c.spent) }))));
  }
  drawBarChart(document.getElementById('dash-bars'), MONTHS.map((m) => ({ label: m.month, value: m.spent })), { highlight: MONTHS.length - 1, format: (v) => money(v) });
}

export function budgetsView() {
  const cards = categories
    .map((c) => {
      const left = c.budget - c.spent;
      const state = left < 0 ? `<span class="over">Over by ${money(-left)}</span>` : `<span class="left">${money(left)} left</span>`;
      return `<div class="budget-card"><div class="budget-head"><strong>${c.name}</strong><span>${money(c.spent)} of ${money(c.budget)}</span></div>${progressBarHTML(c.spent, c.budget, c.name)}<div class="budget-foot"><span>${c.note}</span>${state}</div></div>`;
    })
    .join('');
  const billRows = BILLS.map((b) => `<tr><td>${b.name}</td><td class="num">${moneyCents(b.amount)}</td><td>${b.due}</td><td>${b.status}</td></tr>`).join('');
  return `
  <h1>Budgets for ${HOUSEHOLD.month}</h1>
  <p class="lede">Ten envelopes, ${money(totalBudget())} planned. ${money(totalSpent())} is spent or moved, leaving ${money(totalIncome() - totalSpent())} unbudgeted. Nothing is over budget this month.</p>
  <div class="budget-grid">${cards}</div>
  ${section('Bills this month', 'The fixed bills, their amounts and when they fall due.', `<div class="table-wrap"><table><thead><tr><th>Bill</th><th class="num">Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>${billRows}</tbody></table></div>`)}`;
}

export function expensesView() {
  const options = ['All categories', ...categories.map((c) => c.name)]
    .map((c) => `<option value="${c}">${c}</option>`)
    .join('');
  const catOptions = categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
  return `
  <h1>Expenses</h1>
  <p class="lede">Every dollar out in ${HOUSEHOLD.month}, newest first. Filter by category, add what you spent, or delete a mistaken entry — the budget totals update with it.</p>
  <div class="card">
    <div class="filter-row">
      <label for="expense-filter">Show:</label>
      <select id="expense-filter">${options}</select>
      <span id="expense-count">${expenses.length} expenses · ${money(expenses.reduce((s, e) => s + e.amount, 0))}</span>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody id="expense-rows">${expenseRows(indexedExpenses())}</tbody></table></div>
  </div>
  ${section('Add an expense', 'It appears in the list above straight away, and the matching budget bar moves too.', `
    <form id="add-expense-form" class="form-grid">
      <label>What did you buy?<input id="exp-merchant" type="text" required placeholder="e.g. GreenMart supermarket" maxlength="80"></label>
      <label>Category<select id="exp-category">${catOptions}</select></label>
      <label>Amount ($)<input id="exp-amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
      <button type="submit">Add expense</button>
    </form>
    <p id="add-expense-msg" class="form-msg" aria-live="polite"></p>`)}`;
}

export function expensesBind() {
  const filter = document.getElementById('expense-filter');
  const rows = document.getElementById('expense-rows');
  const count = document.getElementById('expense-count');
  const applyFilter = () => {
    const chosen = filter.value;
    const list = chosen === 'All categories' ? indexedExpenses() : indexedExpenses().filter(({ expense }) => expense.category === chosen);
    rows.innerHTML = expenseRows(list);
    count.textContent = `${list.length} expenses · ${money(list.reduce((s, { expense }) => s + expense.amount, 0))}`;
  };
  filter.addEventListener('change', applyFilter);
  rows.addEventListener('click', (event) => {
    const button = event.target.closest('.delete-btn');
    if (!button) return;
    const merchant = expenses[Number(button.dataset.index)].merchant;
    const category = expenses[Number(button.dataset.index)].category;
    const amount = expenses[Number(button.dataset.index)].amount;
    expenses.splice(Number(button.dataset.index), 1);
    const cat = categories.find((c) => c.name === category);
    if (cat) cat.spent = Math.max(0, Math.round((cat.spent - amount) * 100) / 100);
    applyFilter();
    const msg = document.getElementById('add-expense-msg');
    if (msg) msg.textContent = `Deleted “${merchant}” (${moneyCents(amount)}).`;
  });
  const form = document.getElementById('add-expense-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const merchant = document.getElementById('exp-merchant').value.trim();
    const category = document.getElementById('exp-category').value;
    const amount = Number(document.getElementById('exp-amount').value);
    if (!merchant || !(amount > 0)) return;
    expenses.unshift({ date: '28 Nov', merchant, category, amount });
    const cat = categories.find((c) => c.name === category);
    if (cat) cat.spent = Math.round((cat.spent + amount) * 100) / 100;
    form.reset();
    rerender();
    // Set the confirmation after the re-render: the re-render rebuilds the
    // form, so a message written before it would be wiped away.
    document.getElementById('add-expense-msg').textContent = `Added “${merchant}” — ${moneyCents(amount)} under ${category}.`;
  });
}

export function goalsView() {
  const cards = goals
    .map(
      (g, i) => `<div class="goal-card">
        <div class="budget-head"><strong>${g.name}</strong><span>${money(g.saved)} of ${money(g.target)}</span></div>
        ${progressBarHTML(g.saved, g.target, g.name)}
        <p class="goal-note">${g.note} — ${money(g.target - g.saved)} to go.</p>
        <div class="goal-actions">
          <button class="add-btn" data-index="${i}" data-amount="50">Add $50</button>
          <button class="add-btn" data-index="${i}" data-amount="100">Add $100</button>
          <label class="goal-custom">$<input type="number" min="1" step="1" placeholder="Amount" data-custom="${i}" aria-label="Custom amount for ${g.name}"></label>
          <button class="add-btn" data-custom-add="${i}">Add</button>
        </div>
      </div>`,
    )
    .join('');
  return `
  <h1>Savings goals</h1>
  <p class="lede">Four things the household is saving for. The emergency fund is the priority — it gets the first ${money(800)} of every month.</p>
  <div class="goal-grid">${cards}</div>
  ${section('Start a new goal', 'Give it a name and a target and it joins the list above.', `
    <form id="add-goal-form" class="form-grid">
      <label>Goal name<input id="goal-name" type="text" required placeholder="e.g. New washing machine" maxlength="60"></label>
      <label>Target ($)<input id="goal-target" type="number" min="1" step="1" required placeholder="1000"></label>
      <label>Already saved ($)<input id="goal-saved" type="number" min="0" step="1" value="0"></label>
      <button type="submit">Add goal</button>
    </form>
    <p id="add-goal-msg" class="form-msg" aria-live="polite"></p>`)}`;
}

export function goalsBind() {
  document.querySelectorAll('.add-btn[data-amount]').forEach((button) => {
    button.addEventListener('click', () => {
      const goal = goals[Number(button.dataset.index)];
      goal.saved = Math.min(goal.target, goal.saved + Number(button.dataset.amount));
      rerender();
    });
  });
  document.querySelectorAll('.add-btn[data-custom-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.customAdd);
      const input = document.querySelector(`input[data-custom="${index}"]`);
      const amount = Number(input.value);
      if (!(amount > 0)) return;
      goals[index].saved = Math.min(goals[index].target, goals[index].saved + amount);
      rerender();
    });
  });
  const form = document.getElementById('add-goal-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Number(document.getElementById('goal-target').value);
    const saved = Number(document.getElementById('goal-saved').value) || 0;
    if (!name || !(target > 0)) return;
    goals.push({ name, target, saved: Math.min(saved, target), note: 'Added just now' });
    form.reset();
    rerender();
    // Set the confirmation after the re-render, for the same reason as the
    // expense form: the re-render rebuilds the form it lives in.
    document.getElementById('add-goal-msg').textContent = `Goal “${name}” added — target ${money(target)}.`;
  });
}

export function calculatorsView() {
  const split = fiftyThirtyTwenty(totalIncome());
  return `
  <h1>Calculators</h1>
  <p class="lede">Two quick tools: split any income by the 50/30/20 rule, and work out what to save each month to hit a goal on time.</p>
  <div class="two-col">
    ${section('The 50/30/20 split', '50% needs, 30% wants, 20% savings. Type a monthly income and the split updates as you type.', `
      <label class="calc-label">Monthly income ($)<input id="calc-income" type="number" min="0" step="10" value="${totalIncome()}"></label>
      <ul class="facts">
        <li><strong id="calc-needs">${money(split.needs)}</strong> — needs (rent, bills, groceries)</li>
        <li><strong id="calc-wants">${money(split.wants)}</strong> — wants (eating out, fun, treats)</li>
        <li><strong id="calc-savings">${money(split.savings)}</strong> — savings and extra debt payments</li>
      </ul>
      <p class="chart-note">The Alvarez household earns ${money(totalIncome())} a month, so its split is ${money(split.needs)} / ${money(split.wants)} / ${money(split.savings)}. Its real savings rate is ${Math.round((800 / totalIncome()) * 100)}% — below 20%, which is why the emergency fund comes first.</p>`)}
    ${section('Save for a goal', 'How much a month to reach a target by a date. The answer updates as you type.', `
      <label class="calc-label">Target ($)<input id="goal-target-input" type="number" min="1" step="10" value="2400"></label>
      <label class="calc-label">Already saved ($)<input id="goal-saved-input" type="number" min="0" step="10" value="1100"></label>
      <label class="calc-label">Months to save<input id="goal-months-input" type="number" min="1" step="1" value="8"></label>
      <p class="calc-answer">Save <strong id="goal-monthly">$163</strong> a month.</p>
      <p class="chart-note">That is the summer holiday goal: ${money(2400 - 1100)} still to save over 8 months.</p>`)}
  </div>
  ${section('A worked example', '', `<p>On ${money(totalIncome())} a month, the 50/30/20 rule gives ${money(split.needs)} for needs. The Alvarez household spends ${money(1650 + 240 + 310 + 620)} on housing, utilities, transport and groceries — ${money(2820)} — which sits comfortably inside its needs envelope, leaving room for the ${money(800)} savings transfer.</p>`)}`;
}

export function calculatorsBind() {
  const incomeInput = document.getElementById('calc-income');
  incomeInput.addEventListener('input', () => {
    const split = fiftyThirtyTwenty(Number(incomeInput.value) || 0);
    document.getElementById('calc-needs').textContent = money(split.needs);
    document.getElementById('calc-wants').textContent = money(split.wants);
    document.getElementById('calc-savings').textContent = money(split.savings);
  });
  const targetInput = document.getElementById('goal-target-input');
  const savedInput = document.getElementById('goal-saved-input');
  const monthsInput = document.getElementById('goal-months-input');
  const answer = document.getElementById('goal-monthly');
  const update = () => {
    const remaining = Math.max(0, (Number(targetInput.value) || 0) - (Number(savedInput.value) || 0));
    const months = Math.max(1, Number(monthsInput.value) || 1);
    answer.textContent = money(Math.ceil(remaining / months));
  };
  [targetInput, savedInput, monthsInput].forEach((input) => input.addEventListener('input', update));
}

export function aboutView() {
  const incomeRows = INCOME.map((i) => `<tr><td>${i.source}</td><td class="num">${money(i.amount)}</td></tr>`).join('');
  return `
  <h1>About Hearth & Ledger</h1>
  <p class="lede">A household budget site for one family: the money coming in, the envelopes it is split into, every expense, and the goals the savings are building toward.</p>
  ${section('Where the money comes from', '', `<div class="table-wrap"><table><thead><tr><th>Source</th><th class="num">Per month</th></tr></thead><tbody>${incomeRows}</tbody></table></div><p class="chart-note">Total income ${money(totalIncome())} a month. The budget plans ${money(totalBudget())} of it; the rest is an unbudgeted cushion.</p>`)}
  ${section('How the household budgets', '', `<p>On payday, the month's money is split into ten envelopes — housing, groceries, transport, utilities, dining out, entertainment, clothing, health, savings and everything else. Spending is written down as it happens; the bars on the Budgets page show what is left in each envelope. Savings moves out on payday, before anything else can claim it. A goal is finished when its bar is full, and the money then moves to the next goal.</p><p>Everything you change on this site — a new expense, money added to a goal — lives in your browser for this visit. Nothing is sent anywhere and no account is needed.</p>`)}
  ${section('The household', '', `<p>${HOUSEHOLD.name} — ${HOUSEHOLD.members} — ${HOUSEHOLD.home}. The figures are a worked example: a fictional household shown the way a real family's budget would look.</p>`)}`;
}

export const VIEWS = {
  home: { render: dashboardView, draw: dashboardDraw, bind: null, title: 'November at a glance' },
  budgets: { render: budgetsView, draw: null, bind: null, title: 'Budgets' },
  expenses: { render: expensesView, draw: null, bind: expensesBind, title: 'Expenses' },
  goals: { render: goalsView, draw: null, bind: goalsBind, title: 'Savings goals' },
  calculators: { render: calculatorsView, draw: null, bind: calculatorsBind, title: 'Calculators' },
  about: { render: aboutView, draw: null, bind: null, title: 'About' },
};

// Shown when the address names a page that does not exist, instead of a
// blank screen: the visitor gets the site's sections to pick from.
export function notFoundView() {
  return `
  <h1>Page not found</h1>
  <p class="lede">There is no page at this address. Try one of these instead:</p>
  <ul class="facts">
    <li><a href="#/">Dashboard</a> — the month at a glance</li>
    <li><a href="#/budgets">Budgets</a></li>
    <li><a href="#/expenses">Expenses</a></li>
    <li><a href="#/goals">Savings goals</a></li>
    <li><a href="#/calculators">Calculators</a></li>
    <li><a href="#/about">About</a></li>
  </ul>`;
}
