// The Kitchen Table Ledger — the Marsh household's November 2026 budget data.
// Every figure is the household's own record for the month: paydays, bills and
// the 38 dated transactions below. The pages compute every total from this file,
// so a number shown on one page always matches the same number on another.

export const HOUSEHOLD = {
  name: 'The Marsh Family',
  place: 'Portland, Oregon',
  month: 'November 2026',
  members: ['Maya', 'Daniel', 'Lily', 'Noah'],
  note: 'Maya teaches at Lincoln Elementary; Daniel is an electrician at Rose City Electric. Lily is 9, Noah is 6.',
};

export const CATEGORIES = [
  'Housing', 'Groceries', 'Utilities', 'Transport', 'Dining Out',
  'Kids & School', 'Health', 'Fun & Outings', 'Clothing', 'Home & Garden', 'Misc',
];

// Money in, November 2026. Two paydays each plus Daniel's weekend jobs.
export const INCOME = [
  { date: '2026-11-01', description: 'Maya — salary, Lincoln Elementary', member: 'Maya', amount: 1700.0 },
  { date: '2026-11-01', description: 'Daniel — salary, Rose City Electric', member: 'Daniel', amount: 1325.0 },
  { date: '2026-11-08', description: 'Daniel — weekend wiring job, the Hendersons', member: 'Daniel', amount: 95.0 },
  { date: '2026-11-15', description: 'Maya — salary, Lincoln Elementary', member: 'Maya', amount: 1700.0 },
  { date: '2026-11-15', description: 'Daniel — salary, Rose City Electric', member: 'Daniel', amount: 1325.0 },
  { date: '2026-11-22', description: 'Daniel — weekend outlet job, the Parkers', member: 'Daniel', amount: 95.0 },
];

// Money out, November 2026. Each row is a real receipt or bill the family kept.
export const TRANSACTIONS = [
  { date: '2026-11-01', description: 'Rent — 214 Alder Street', category: 'Housing', member: 'Maya', amount: 1450.0 },
  { date: '2026-11-02', description: 'Fred Meyer — weekly shop', category: 'Groceries', member: 'Maya', amount: 132.4 },
  { date: '2026-11-03', description: 'Chevron — gas, the minivan', category: 'Transport', member: 'Daniel', amount: 42.0 },
  { date: '2026-11-04', description: 'CVS — prescriptions and vitamins', category: 'Health', member: 'Maya', amount: 28.4 },
  { date: '2026-11-05', description: 'Piano lessons — Lily, November', category: 'Kids & School', member: 'Maya', amount: 120.0 },
  { date: '2026-11-06', description: 'Pizza night — Domino’s', category: 'Dining Out', member: 'Daniel', amount: 38.9 },
  { date: '2026-11-07', description: 'New Seasons — weekly shop', category: 'Groceries', member: 'Daniel', amount: 86.15 },
  { date: '2026-11-07', description: 'Movie night — Regal, family of four', category: 'Fun & Outings', member: 'Daniel', amount: 34.0 },
  { date: '2026-11-08', description: 'PGE — electric bill', category: 'Utilities', member: 'Maya', amount: 96.4 },
  { date: '2026-11-09', description: 'Costco — bulk shop', category: 'Groceries', member: 'Daniel', amount: 148.9 },
  { date: '2026-11-09', description: 'Hardware store — light bulbs and batteries', category: 'Home & Garden', member: 'Daniel', amount: 23.4 },
  { date: '2026-11-10', description: 'Gas — Shell, the minivan', category: 'Transport', member: 'Daniel', amount: 38.5 },
  { date: '2026-11-10', description: 'Noah’s winter coat — Target', category: 'Clothing', member: 'Maya', amount: 68.0 },
  { date: '2026-11-11', description: 'School supplies — Lily and Noah', category: 'Kids & School', member: 'Maya', amount: 42.6 },
  { date: '2026-11-12', description: 'City of Portland — water and sewer', category: 'Utilities', member: 'Maya', amount: 74.2 },
  { date: '2026-11-12', description: 'Birthday gift for Grandma Rose', category: 'Misc', member: 'Maya', amount: 35.0 },
  { date: '2026-11-13', description: 'Thai takeout — Baan Thai', category: 'Dining Out', member: 'Daniel', amount: 46.25 },
  { date: '2026-11-14', description: 'Fred Meyer — weekly shop', category: 'Groceries', member: 'Maya', amount: 97.6 },
  { date: '2026-11-14', description: 'Oregon Museum of Science — family tickets', category: 'Fun & Outings', member: 'Daniel', amount: 28.0 },
  { date: '2026-11-15', description: 'Ziply Fiber — internet', category: 'Utilities', member: 'Maya', amount: 65.0 },
  { date: '2026-11-15', description: 'Plumber — fixed the kitchen sink leak', category: 'Home & Garden', member: 'Daniel', amount: 145.0 },
  { date: '2026-11-16', description: 'Dentist copay — Noah’s checkup', category: 'Health', member: 'Maya', amount: 45.0 },
  { date: '2026-11-17', description: 'Gas — Chevron, the minivan', category: 'Transport', member: 'Daniel', amount: 44.75 },
  { date: '2026-11-17', description: 'Maya’s work shoes — DSW', category: 'Clothing', member: 'Maya', amount: 54.99 },
  { date: '2026-11-18', description: 'T-Mobile — two lines', category: 'Utilities', member: 'Daniel', amount: 84.0 },
  { date: '2026-11-18', description: 'Curtain rod and hooks — IKEA', category: 'Home & Garden', member: 'Maya', amount: 31.5 },
  { date: '2026-11-19', description: 'Lily’s soccer — winter session fee', category: 'Kids & School', member: 'Daniel', amount: 65.0 },
  { date: '2026-11-20', description: 'Fred Meyer — weekly shop', category: 'Groceries', member: 'Maya', amount: 64.3 },
  { date: '2026-11-20', description: 'Geico — car insurance, November', category: 'Transport', member: 'Daniel', amount: 132.5 },
  { date: '2026-11-21', description: 'Burgers — Burgerville, after soccer', category: 'Dining Out', member: 'Daniel', amount: 31.4 },
  { date: '2026-11-22', description: 'Health insurance premium — Providence', category: 'Health', member: 'Maya', amount: 412.0 },
  { date: '2026-11-23', description: 'Board game — Ticket to Ride', category: 'Fun & Outings', member: 'Maya', amount: 24.99 },
  { date: '2026-11-24', description: 'Winter boots — Noah, REI', category: 'Clothing', member: 'Daniel', amount: 89.99 },
  { date: '2026-11-25', description: 'New Seasons — Thanksgiving shop', category: 'Groceries', member: 'Maya', amount: 112.75 },
  { date: '2026-11-25', description: 'Haircuts — Maya and Noah', category: 'Misc', member: 'Maya', amount: 48.0 },
  { date: '2026-11-26', description: 'Costco — Thanksgiving stock-up', category: 'Groceries', member: 'Daniel', amount: 156.8 },
  { date: '2026-11-26', description: 'Coffee and pastries — Stumptown', category: 'Dining Out', member: 'Maya', amount: 18.75 },
  { date: '2026-11-27', description: 'Oil change — Jiffy Lube, the minivan', category: 'Transport', member: 'Daniel', amount: 189.0 },
];

// The plan for the month, set on 1 November before any spending happened.
export const BUDGETS = [
  { category: 'Housing', planned: 1450.0 },
  { category: 'Groceries', planned: 750.0 },
  { category: 'Utilities', planned: 330.0 },
  { category: 'Transport', planned: 420.0 },
  { category: 'Dining Out', planned: 180.0 },
  { category: 'Kids & School', planned: 260.0 },
  { category: 'Health', planned: 500.0 },
  { category: 'Fun & Outings', planned: 150.0 },
  { category: 'Clothing', planned: 180.0 },
  { category: 'Home & Garden', planned: 220.0 },
  { category: 'Misc', planned: 120.0 },
];

// The month's savings transfer, split across the four goals below.
export const SAVINGS_PLAN = 900.0;

// Recurring bills. `paid` is the state on 27 November; the site lets the
// family mark a bill paid, and remembers it in this browser.
export const BILLS = [
  { name: 'Rent — 214 Alder Street', amount: 1450.0, due: '2026-11-01', paid: true, autopay: true },
  { name: 'PGE — electric', amount: 96.4, due: '2026-11-08', paid: true, autopay: true },
  { name: 'City of Portland — water and sewer', amount: 74.2, due: '2026-11-12', paid: true, autopay: false },
  { name: 'Ziply Fiber — internet', amount: 65.0, due: '2026-11-15', paid: true, autopay: true },
  { name: 'T-Mobile — two lines', amount: 84.0, due: '2026-11-18', paid: true, autopay: true },
  { name: 'Geico — car insurance', amount: 132.5, due: '2026-11-20', paid: true, autopay: true },
  { name: 'Providence — health insurance premium', amount: 412.0, due: '2026-11-22', paid: true, autopay: true },
  { name: 'Piano lessons — Lily', amount: 120.0, due: '2026-11-25', paid: true, autopay: false },
  { name: 'Gym — Maya and Daniel', amount: 39.0, due: '2026-11-28', paid: false, autopay: true },
  { name: 'Streaming — Netflix and Disney+', amount: 24.99, due: '2026-11-30', paid: false, autopay: true },
];

// What the family is saving for. `monthly` is the planned transfer each month.
export const GOALS = [
  { name: 'Emergency fund', saved: 7200.0, target: 10000.0, monthly: 300.0, note: 'Six months of rent and bills, for the month nobody plans for.' },
  { name: 'Summer road trip — Oregon coast', saved: 840.0, target: 1500.0, monthly: 150.0, note: 'Cannon Beach for a week in July: cabin, gas, fish and chips.' },
  { name: 'New car fund', saved: 2350.0, target: 8000.0, monthly: 250.0, note: 'The minivan is 11 years old. A used RAV4, cash, no car payment.' },
  { name: 'Lily’s braces', saved: 1100.0, target: 2400.0, monthly: 200.0, note: 'The orthodontist quoted $2,400 after insurance. Appointments start in March.' },
];

// June to October 2026, for the six-month cash-flow chart.
export const HISTORY = [
  { month: 'Jun', income: 6180.0, spending: 4612.0 },
  { month: 'Jul', income: 6240.0, spending: 4788.0 },
  { month: 'Aug', income: 6310.0, spending: 5124.0 },
  { month: 'Sep', income: 6240.0, spending: 4402.0 },
  { month: 'Oct', income: 6265.0, spending: 4521.0 },
];
