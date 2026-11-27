// The Kitchen Table Ledger — router and views. All content is rendered from
// data.js; every total on every page is computed from the same rows, so the
// numbers always agree. The family's own additions (a logged purchase, a bill
// marked paid, money added to a goal) are kept in this browser's localStorage
// under 'ktl-v1' — nothing leaves the machine.
//
//   #/                Overview
//   #/transactions    the full ledger, with filters and an add-a-purchase form
//   #/budgets         the month's plan against what was spent, and the 50/30/20 rule
//   #/bills           recurring bills, with paid toggles
//   #/goals           savings goals, with contribute buttons
//   #/reports         where the money went, six months of cash flow, insights
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import * as D from './data.js';
import { cashFlowChart, savingsLineChart, donutChart, splitBars } from './charts.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const OPENING_BALANCE = 2140.0; // checking account, 1 November 2026
const NEEDS = ['Housing', 'Groceries', 'Utilities', 'Transport', 'Kids & School', 'Health'];
const WANTS = ['Dining Out', 'Fun & Outings', 'Clothing', 'Home & Garden', 'Misc'];

const NAV = [
  ['#/', 'Overview'],
  ['#/transactions', 'Transactions'],
  ['#/budgets', 'Budgets'],
  ['#/bills', 'Bills'],
  ['#/goals', 'Goals'],
  ['#/reports', 'Reports'],
];

// ---- the family's own edits, kept in this browser only --------------------
function loadStore() {
  try {
    return JSON.parse(localStorage.getItem('ktl-v1')) || { added: [], bills: {}, goals: {} };
  } catch {
    return { added: [], bills: {}, goals: {} };
  }
}
let store = loadStore();
function saveStore() {
  try { localStorage.setItem('ktl-v1', JSON.stringify(store)); } catch { /* private mode */ }
}
function addedTx() { return store.added; }
function billPaid(bill) {
  return bill.name in store.bills ? store.bills[bill.name] : bill.paid;
}
function goalSaved(goal) {
  return goal.saved + (store.goals[goal.name] || 0);
}

// ---- small helpers ---------------------------------------------------------
function money(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dateLabel(iso) {
  const [, m, d] = iso.split('-').map(Number);
  return MONTHS_SHORT[m - 1] + ' ' + d;
}
function sumAmounts(rows) { return rows.reduce((s, r) => s + r.amount, 0); }
function allSpending() { return [...D.TRANSACTIONS, ...addedTx()]; }
function totalIncome() { return sumAmounts(D.INCOME); }
function totalSpending() { return sumAmounts(allSpending()); }
function spentByCategory() {
  const by = {};
  for (const c of D.CATEGORIES) by[c] = 0;
  for (const t of allSpending()) by[t.category] = (by[t.category] || 0) + t.amount;
  return by;
}
function monthNameAfter(monthsAhead) {
  // monthsAhead months after November 2026, as 'Sep 2027'.
  const base = new Date(2026, 10, 1);
  base.setMonth(base.getMonth() + monthsAhead);
  return MONTHS_SHORT[base.getMonth()] + ' ' + base.getFullYear();
}
function tableHtml(headers, rows) {
  return '<div class="tablewrap"><table><thead><tr>' +
    headers.map((h) => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') +
    '</tbody></table></div>';
}
function progressBar(pct, over) {
  const capped = Math.min(100, pct);
  return `<div class="bar" role="img" aria-label="${Math.round(pct)} percent of budget spent">` +
    `<span class="${over ? 'fill over' : 'fill'}" style="width:${capped}%"></span></div>`;
}
function navHtml(active) {
  return NAV.map(([href, label]) =>
    `<a href="${href}" class="${href === active ? 'active' : ''}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
}

// ---- Overview --------------------------------------------------------------
function overview() {
  const income = totalIncome();
  const spent = totalSpending();
  const left = income - spent - D.SAVINGS_PLAN;
  const byCat = spentByCategory();
  const health = D.BUDGETS
    .map((b) => ({ ...b, actual: byCat[b.category] || 0, pct: ((byCat[b.category] || 0) / b.planned) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const upcoming = D.BILLS.filter((b) => !billPaid(b)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  const recent = [...allSpending()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const months = [...D.HISTORY, { month: 'Nov', income, spending: spent }];
  return `
  <section class="hero">
    <p class="kicker">The Marsh Family · Portland, Oregon · November 2026</p>
    <h1>Every dollar has a job.</h1>
    <p class="lede">Maya and Daniel bring home ${money(income)} a month. This is where it goes:
    the rent, the groceries, the piano lessons, the oil change — and the $900 that goes
    straight to the family's four savings goals before anything else gets spent.</p>
  </section>
  <section class="kpis" aria-label="November at a glance">
    <div class="kpi"><span class="kpi-label">Income</span><span class="kpi-value">${money(income)}</span><span class="kpi-sub">2 salaries + weekend jobs</span></div>
    <div class="kpi"><span class="kpi-label">Spent so far</span><span class="kpi-value">${money(spent)}</span><span class="kpi-sub">${allSpending().length} purchases, 1–27 Nov</span></div>
    <div class="kpi"><span class="kpi-label">To savings goals</span><span class="kpi-value">${money(D.SAVINGS_PLAN)}</span><span class="kpi-sub">Emergency · trip · car · braces</span></div>
    <div class="kpi ${left < 0 ? 'bad' : 'good'}"><span class="kpi-label">Left to budget</span><span class="kpi-value">${money(left)}</span><span class="kpi-sub">${left < 0 ? 'Over the plan — see Budgets' : 'Still unassigned — give it a job'}</span></div>
  </section>
  <section class="panel">
    <h2>Cash flow — six months</h2>
    <p class="panel-sub">Income against spending, June to November 2026. November is the second-best
    saving month of the half-year: ${money(income - spent)} kept.</p>
    <canvas id="cashflow" aria-label="Bar chart of monthly income and spending"></canvas>
    ${tableHtml(['Month', 'Income', 'Spending', 'Kept'], months.map((m) =>
      [m.month, money(m.income), money(m.spending), money(m.income - m.spending)]))}
  </section>
  <div class="twocol">
    <section class="panel">
      <h2>Budget health</h2>
      <p class="panel-sub">The four categories closest to — or over — their plan. <a href="#/budgets">All eleven budgets →</a></p>
      ${health.map((b) => `
        <div class="budgetrow">
          <div class="budgetrow-head"><span>${b.category}</span><span>${money(b.actual)} of ${money(b.planned)} · ${Math.round(b.pct)}%</span></div>
          ${progressBar(b.pct, b.pct > 100)}
        </div>`).join('')}
    </section>
    <section class="panel">
      <h2>Coming up</h2>
      <p class="panel-sub">Bills still to pay this month. <a href="#/bills">All ten bills →</a></p>
      ${upcoming.length ? upcoming.map((b) => `
        <div class="billmini"><span>${esc(b.name)}</span><span><strong>${money(b.amount)}</strong> · due ${dateLabel(b.due)}</span></div>`).join('')
        : '<p>Nothing left to pay in November. December’s bills land on the 1st.</p>'}
      <h3 class="recent-h">Latest spending</h3>
      <ul class="recent">
        ${recent.map((t) => `<li><span>${dateLabel(t.date)} — ${esc(t.description)}</span><strong>${money(t.amount)}</strong></li>`).join('')}
      </ul>
      <p><a href="#/transactions">Full ledger →</a></p>
    </section>
  </div>`;
}

// ---- Transactions ----------------------------------------------------------
const txState = { category: 'All', member: 'All', q: '', sort: 'newest' };
function ledgerRows() {
  // Every money movement, income first on a shared date, running balance from the opening balance.
  const addedSet = new Set(store.added);
  const moves = [
    ...D.INCOME.map((r) => ({ ...r, category: 'Income', kind: 'in' })),
    ...allSpending().map((r) => ({ ...r, kind: 'out', added: addedSet.has(r) })),
  ].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'in' ? -1 : 1));
  let balance = OPENING_BALANCE;
  return moves.map((m) => {
    balance += m.kind === 'in' ? m.amount : -m.amount;
    return { ...m, balance };
  });
}
function transactionsView() {
  const rows = ledgerRows();
  const filtered = rows.filter((r) =>
    (txState.category === 'All' || r.category === txState.category) &&
    (txState.member === 'All' || r.member === txState.member) &&
    (txState.q === '' || r.description.toLowerCase().includes(txState.q.toLowerCase())));
  const sorted = [...filtered].sort((a, b) => {
    if (txState.sort === 'oldest') return a.date.localeCompare(b.date);
    if (txState.sort === 'high') return b.amount - a.amount;
    if (txState.sort === 'low') return a.amount - b.amount;
    return b.date.localeCompare(a.date) || (a.kind === 'in' ? -1 : 1);
  });
  const shownOut = sumAmounts(sorted.filter((r) => r.kind === 'out'));
  const shownIn = sumAmounts(sorted.filter((r) => r.kind === 'in'));
  return `
  <section class="hero slim">
    <h1>Transactions</h1>
    <p class="lede">Every dollar in and out, 1–27 November 2026. The checking account opened
    the month at ${money(OPENING_BALANCE)}; it now holds ${money(rows[rows.length - 1].balance)}.
    Log a purchase below and it joins the ledger — saved in this browser only.</p>
  </section>
  <section class="panel">
    <form id="tx-filters" class="filters" aria-label="Filter transactions">
      <label>Category
        <select id="f-category">
          <option ${txState.category === 'All' ? 'selected' : ''}>All</option>
          <option ${txState.category === 'Income' ? 'selected' : ''}>Income</option>
          ${D.CATEGORIES.map((c) => `<option ${txState.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label>Who
        <select id="f-member">
          <option ${txState.member === 'All' ? 'selected' : ''}>All</option>
          ${D.HOUSEHOLD.members.slice(0, 2).map((m) => `<option ${txState.member === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </label>
      <label>Search
        <input id="f-q" type="search" placeholder="e.g. Costco" value="${esc(txState.q)}" aria-label="Search transactions">
      </label>
      <label>Sort
        <select id="f-sort">
          <option value="newest" ${txState.sort === 'newest' ? 'selected' : ''}>Newest first</option>
          <option value="oldest" ${txState.sort === 'oldest' ? 'selected' : ''}>Oldest first</option>
          <option value="high" ${txState.sort === 'high' ? 'selected' : ''}>Largest amount</option>
          <option value="low" ${txState.sort === 'low' ? 'selected' : ''}>Smallest amount</option>
        </select>
      </label>
    </form>
    <p class="panel-sub" id="tx-count">Showing ${sorted.length} of ${rows.length} movements — ${money(shownIn)} in, ${money(shownOut)} out.</p>
    ${tableHtml(['Date', 'What', 'Category', 'Who', 'Amount', 'Balance'], sorted.map((r) => [
      dateLabel(r.date),
      esc(r.description) + (r.added ? ' <span class="tag">added by you</span>' : ''),
      r.category,
      r.member,
      `<span class="${r.kind === 'in' ? 'in' : 'out'}">${r.kind === 'in' ? '+' : '−'}${money(r.amount)}</span>`,
      money(r.balance),
    ]))}
  </section>
  <section class="panel">
    <h2>Log a purchase</h2>
    <p class="panel-sub">It is added to the ledger above, to its category total on the Budgets page,
    and to the charts on Reports — and saved in this browser, so it is still here tomorrow.</p>
    <form id="tx-add" class="addform">
      <label>Date <input id="a-date" type="date" value="2026-11-27" min="2026-11-01" max="2026-11-30" required></label>
      <label>What <input id="a-desc" type="text" placeholder="e.g. Farmers market — vegetables" maxlength="80" required></label>
      <label>Category
        <select id="a-category">${D.CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
      </label>
      <label>Who
        <select id="a-member">${D.HOUSEHOLD.members.slice(0, 2).map((m) => `<option>${m}</option>`).join('')}</select>
      </label>
      <label>Amount ($) <input id="a-amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></label>
      <button type="submit">Add to the ledger</button>
    </form>
    <p class="form-msg" id="add-msg" role="status"></p>
    <p><button type="button" class="linkbtn" id="dl-tx">Download the ledger as CSV</button></p>
  </section>`;
}

// ---- Budgets ---------------------------------------------------------------
function budgetsView() {
  const income = totalIncome();
  const byCat = spentByCategory();
  const plannedTotal = sumAmounts(D.BUDGETS.map((b) => ({ amount: b.planned })));
  const spentTotal = totalSpending();
  const needs = NEEDS.reduce((s, c) => s + (byCat[c] || 0), 0);
  const wants = WANTS.reduce((s, c) => s + (byCat[c] || 0), 0);
  const saved = income - spentTotal;
  const rule = [
    { label: 'Needs', actual: needs, target: 50, note: 'Rent, groceries, utilities, transport, kids, health' },
    { label: 'Wants', actual: wants, target: 30, note: 'Eating out, fun, clothes, the house, the rest' },
    { label: 'Saved', actual: saved, target: 20, note: 'To goals, plus what is left to budget' },
  ];
  return `
  <section class="hero slim">
    <h1>Budgets</h1>
    <p class="lede">The plan was set on 1 November: ${money(plannedTotal)} of spending across eleven
    categories, plus ${money(D.SAVINGS_PLAN)} to the goals. So far the family has spent
    ${money(spentTotal)} — ${Math.round((spentTotal / plannedTotal) * 100)}% of the plan, with three days to go.</p>
  </section>
  <section class="panel">
    <h2>The 50/30/20 rule</h2>
    <p class="panel-sub">A common rule of thumb: 50% of income on needs, 30% on wants, 20% saved.
    Portland rent pushes the Marshes’ needs over 50% — and the savings still beat 20%.</p>
    ${rule.map((r) => {
      const pct = (r.actual / income) * 100;
      return `<div class="rule">
        <div class="rule-head"><span><strong>${r.label}</strong> — ${r.note}</span><span>${money(r.actual)} · ${pct.toFixed(1)}% of income (target ${r.target}%)</span></div>
        <div class="bar"><span class="fill" style="width:${Math.min(100, pct)}%"></span><span class="marker" style="left:${r.target}%"></span></div>
      </div>`;
    }).join('')}
  </section>
  <section class="panel">
    <h2>Every category</h2>
    <p class="panel-sub">Three categories are over plan — groceries, transport and clothing — and the
    rest have room. A bar past the end of its track is over budget.</p>
    ${D.BUDGETS.map((b) => {
      const actual = byCat[b.category] || 0;
      const pct = (actual / b.planned) * 100;
      const diff = actual - b.planned;
      const diffTxt = diff > 0.005
        ? `<span class="over-txt">${money(diff)} over</span>`
        : Math.abs(diff) < 0.005
          ? '<span class="under-txt">exactly on plan</span>'
          : `<span class="under-txt">${money(-diff)} left</span>`;
      return `<div class="budgetrow big">
        <div class="budgetrow-head"><span><strong>${b.category}</strong></span>
        <span>${money(actual)} of ${money(b.planned)} · ${Math.round(pct)}% · ${diffTxt}</span></div>
        ${progressBar(pct, pct > 100)}
      </div>`;
    }).join('')}
    <p><button type="button" class="linkbtn" id="dl-budgets">Download the budgets as CSV</button></p>
  </section>`;
}

// ---- Bills -----------------------------------------------------------------
function billsView() {
  const total = sumAmounts(D.BILLS);
  const paidTotal = sumAmounts(D.BILLS.filter((b) => billPaid(b)));
  const unpaid = D.BILLS.filter((b) => !billPaid(b));
  return `
  <section class="hero slim">
    <h1>Bills</h1>
    <p class="lede">Ten recurring bills in November, ${money(total)} all together. ${money(paidTotal)}
    is paid; ${unpaid.length ? money(sumAmounts(unpaid)) + ' is still to go' : 'everything is paid'}.
    Six of them are on autopay — the other four need a tap.</p>
  </section>
  <section class="panel">
    <h2>November bills</h2>
    <p class="panel-sub">Mark a bill paid and the site remembers it in this browser. Unpaid bills
    past their date would show as overdue — none are, this month.</p>
    ${tableHtml(['Bill', 'Due', 'Amount', 'Autopay', 'Status'], D.BILLS.map((b) => [
      esc(b.name),
      dateLabel(b.due),
      money(b.amount),
      b.autopay ? 'Yes' : 'No',
      billPaid(b)
        ? `<button type="button" class="paidbtn is-paid" data-bill="${esc(b.name)}">Paid ✓</button>`
        : `<button type="button" class="paidbtn" data-bill="${esc(b.name)}">Mark paid</button>`,
    ]))}
    <p class="panel-sub">Next up: ${unpaid.length ? unpaid.map((b) => `${esc(b.name)} — ${money(b.amount)} on ${dateLabel(b.due)}`).join('; ') : 'nothing — November is settled.'}</p>
  </section>`;
}

// ---- Goals -----------------------------------------------------------------
function goalsView() {
  const totalSaved = D.GOALS.reduce((s, g) => s + goalSaved(g), 0);
  const totalTarget = sumAmounts(D.GOALS.map((g) => ({ amount: g.target })));
  return `
  <section class="hero slim">
    <h1>Savings goals</h1>
    <p class="lede">The family moves ${money(D.SAVINGS_PLAN)} to these four goals on the 1st of every
    month, before anything else gets spent. Together they hold ${money(totalSaved)} of
    ${money(totalTarget)} — ${Math.round((totalSaved / totalTarget) * 100)}% of the way there.</p>
  </section>
  <section class="goals">
    ${D.GOALS.map((g) => {
      const saved = goalSaved(g);
      const pct = (saved / g.target) * 100;
      const monthsLeft = Math.max(0, Math.ceil((g.target - saved) / g.monthly));
      return `<article class="panel goal">
        <h2>${esc(g.name)}</h2>
        <p class="goal-amount"><strong>${money(saved)}</strong> of ${money(g.target)} · ${Math.round(pct)}%</p>
        ${progressBar(pct, false)}
        <p class="panel-sub">${esc(g.note)}</p>
        <p>${money(g.monthly)} a month · ${monthsLeft === 0 ? 'done' : `done around ${monthNameAfter(monthsLeft)}`}</p>
        <div class="goal-btns">
          <button type="button" data-goal="${esc(g.name)}" data-amount="25">Add $25</button>
          <button type="button" data-goal="${esc(g.name)}" data-amount="50">Add $50</button>
        </div>
      </article>`;
    }).join('')}
  </section>`;
}

// ---- Reports ---------------------------------------------------------------
function reportsView() {
  const byCat = spentByCategory();
  const spent = totalSpending();
  const income = totalIncome();
  const slices = D.CATEGORIES.map((c) => ({ label: c, value: byCat[c] || 0 }))
    .filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const months = [...D.HISTORY, { month: 'Nov', income, spending: spent }];
  const byMember = {};
  for (const t of allSpending()) byMember[t.member] = (byMember[t.member] || 0) + t.amount;
  const split = D.HOUSEHOLD.members.slice(0, 2).map((m) => ({ label: m, value: byMember[m] || 0 }));
  const thanksgivingGroceries = 112.75 + 156.8;
  return `
  <section class="hero slim">
    <h1>Reports</h1>
    <p class="lede">Where November's ${money(spent)} went, who spent it, and how the month compares
    with the five before it. Every chart below is followed by its numbers in a table.</p>
  </section>
  <section class="panel">
    <h2>Spending by category</h2>
    <p class="panel-sub">Housing is nearly a third of everything the family spends — rent is the
    budget's biggest single line, as it is for most households.</p>
    <canvas id="donut" aria-label="Donut chart of spending by category"></canvas>
    ${tableHtml(['Category', 'Spent', 'Share'], slices.map((s) => [s.label, money(s.value), Math.round((s.value / spent) * 100) + '%']))}
  </section>
  <section class="panel">
    <h2>Six months of saving</h2>
    <p class="panel-sub">What was kept each month — income minus spending. August was the thinnest
    month (back-to-school); September the fattest.</p>
    <canvas id="savingsline" aria-label="Line chart of monthly savings"></canvas>
    ${tableHtml(['Month', 'Income', 'Spending', 'Kept', 'Savings rate'], months.map((m) => {
      const kept = m.income - m.spending;
      return [m.month, money(m.income), money(m.spending), money(kept), ((kept / m.income) * 100).toFixed(1) + '%'];
    }))}
  </section>
  <div class="twocol">
    <section class="panel">
      <h2>Who paid for what</h2>
      <p class="panel-sub">Maya pays the rent, the bills and most of the groceries; Daniel pays for
      the car, the fun and the hardware store runs.</p>
      <canvas id="split" aria-label="Bar chart of spending by household member"></canvas>
      ${tableHtml(['Who', 'Spent'], split.map((s) => [s.label, money(s.value)]))}
    </section>
    <section class="panel">
      <h2>What November says</h2>
      <ul class="insights">
        <li><strong>Groceries ran ${money(798.9 - 750)} over plan.</strong> The Thanksgiving shop did it: ${money(thanksgivingGroceries)} of groceries in the last six days of the month. December's plan should allow for it.</li>
        <li><strong>Eating out came in ${money(180 - 135.3)} under plan.</strong> Four meals out all month — cooking at home is the budget's quiet win.</li>
        <li><strong>Transport is ${money(446.75 - 420)} over.</strong> The ${money(189)} oil change on 27 November, not driving — gas itself was ${money(42 + 38.5 + 44.75)} for the month.</li>
        <li><strong>The savings rate is ${(((income - spent) / income) * 100).toFixed(1)}%.</strong> The second-best month since June; only September (29.5%) was better.</li>
      </ul>
      <p><button type="button" class="linkbtn" id="dl-tx2">Download the ledger as CSV</button>
      <button type="button" class="linkbtn" id="dl-budgets2">Download the budgets as CSV</button></p>
    </section>
  </div>`;
}

// ---- CSV downloads -----------------------------------------------------------
function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvEscape(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function transactionsCsv() {
  const rows = ledgerRows();
  const lines = [['Date', 'What', 'Category', 'Who', 'Amount', 'Balance'].map(csvEscape).join(',')];
  for (const r of rows) {
    lines.push([r.date, r.description, r.category, r.member, (r.kind === 'in' ? '' : '-') + r.amount.toFixed(2), r.balance.toFixed(2)].map(csvEscape).join(','));
  }
  return lines.join('\n') + '\n';
}
function budgetsCsv() {
  const byCat = spentByCategory();
  const lines = [['Category', 'Planned', 'Spent', 'Left'].map(csvEscape).join(',')];
  for (const b of D.BUDGETS) {
    const actual = byCat[b.category] || 0;
    lines.push([b.category, b.planned.toFixed(2), actual.toFixed(2), (b.planned - actual).toFixed(2)].map(csvEscape).join(','));
  }
  return lines.join('\n') + '\n';
}

// ---- render ------------------------------------------------------------------
const TITLES = {
  '': 'The Kitchen Table Ledger · The Marsh Family Budget',
  transactions: 'Transactions | The Kitchen Table Ledger',
  budgets: 'Budgets | The Kitchen Table Ledger',
  bills: 'Bills | The Kitchen Table Ledger',
  goals: 'Savings Goals | The Kitchen Table Ledger',
  reports: 'Reports | The Kitchen Table Ledger',
};

function render() {
  window.__shotReady = false;
  const route = (location.hash.match(/^#\/([a-z]+)/) || [null, ''])[1];
  const active = '#/' + route;
  nav.innerHTML = navHtml(route === '' ? '#/' : active);
  let html;
  if (route === 'transactions') html = transactionsView();
  else if (route === 'budgets') html = budgetsView();
  else if (route === 'bills') html = billsView();
  else if (route === 'goals') html = goalsView();
  else if (route === 'reports') html = reportsView();
  else html = overview();
  document.title = TITLES[route] || TITLES[''];
  app.innerHTML = html;
  bind(route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function bind(route) {
  const income = totalIncome();
  const spent = totalSpending();
  if (route === '') {
    const months = [...D.HISTORY, { month: 'Nov', income, spending: spent }];
    const c = document.getElementById('cashflow');
    if (c) cashFlowChart(c, months);
  }
  if (route === 'reports') {
    const byCat = spentByCategory();
    const slices = D.CATEGORIES.map((c) => ({ label: c, value: byCat[c] || 0 }))
      .filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
    const d = document.getElementById('donut');
    if (d) donutChart(d, slices);
    const months = [...D.HISTORY, { month: 'Nov', income, spending: spent }];
    const l = document.getElementById('savingsline');
    if (l) savingsLineChart(l, months);
    const byMember = {};
    for (const t of allSpending()) byMember[t.member] = (byMember[t.member] || 0) + t.amount;
    const s = document.getElementById('split');
    if (s) splitBars(s, D.HOUSEHOLD.members.slice(0, 2).map((m) => ({ label: m, value: byMember[m] || 0 })));
  }
  if (route === 'transactions') {
    const form = document.getElementById('tx-filters');
    if (form) {
      form.addEventListener('change', (ev) => {
        if (ev.target.id === 'f-category') txState.category = ev.target.value;
        if (ev.target.id === 'f-member') txState.member = ev.target.value;
        if (ev.target.id === 'f-sort') txState.sort = ev.target.value;
        render();
      });
      form.addEventListener('input', (ev) => {
        if (ev.target.id === 'f-q') {
          txState.q = ev.target.value;
          render();
          const q = document.getElementById('f-q');
          if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
        }
      });
    }
    const add = document.getElementById('tx-add');
    if (add) {
      add.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const desc = document.getElementById('a-desc').value.trim();
        const amount = Number(document.getElementById('a-amount').value);
        if (!desc || !(amount > 0)) return;
        store.added.push({
          date: document.getElementById('a-date').value,
          description: desc,
          category: document.getElementById('a-category').value,
          member: document.getElementById('a-member').value,
          amount: Math.round(amount * 100) / 100,
        });
        saveStore();
        document.getElementById('add-msg').textContent =
          `Added ${desc} — ${money(amount)}. The ledger, budgets and reports all include it now.`;
        render();
        const msg = document.getElementById('add-msg');
        if (msg) msg.textContent = `Added ${desc} — ${money(amount)}. The ledger, budgets and reports all include it now.`;
      });
    }
    const dl = document.getElementById('dl-tx');
    if (dl) dl.addEventListener('click', () => downloadCsv('marsh-family-ledger-november-2026.csv', transactionsCsv()));
  }
  if (route === 'budgets') {
    const dl = document.getElementById('dl-budgets');
    if (dl) dl.addEventListener('click', () => downloadCsv('marsh-family-budgets-november-2026.csv', budgetsCsv()));
  }
  if (route === 'bills') {
    app.querySelectorAll('.paidbtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.bills[btn.dataset.bill] = !billPaid(D.BILLS.find((b) => b.name === btn.dataset.bill));
        saveStore();
        render();
      });
    });
  }
  if (route === 'goals') {
    app.querySelectorAll('.goal-btns button').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.goals[btn.dataset.goal] = (store.goals[btn.dataset.goal] || 0) + Number(btn.dataset.amount);
        saveStore();
        render();
      });
    });
  }
  if (route === 'reports') {
    const dl1 = document.getElementById('dl-tx2');
    if (dl1) dl1.addEventListener('click', () => downloadCsv('marsh-family-ledger-november-2026.csv', transactionsCsv()));
    const dl2 = document.getElementById('dl-budgets2');
    if (dl2) dl2.addEventListener('click', () => downloadCsv('marsh-family-budgets-november-2026.csv', budgetsCsv()));
  }
}

window.addEventListener('hashchange', render);
render();
