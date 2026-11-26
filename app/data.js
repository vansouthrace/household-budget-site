// Hearth & Ledger — all figures for the household budget site live here.
// The Alvarez household is fictional; every number below is a fixed figure
// the pages and charts read, so nothing on the site is a placeholder. The
// month shown throughout is November 2025.

export const HOUSEHOLD = {
  name: 'The Alvarez household',
  members: 'Mara & Dev Alvarez, plus Sofia (9) and Leo (6)',
  home: '3-bedroom house, Riverside',
  month: 'November 2025',
};

export const INCOME = [
  { source: 'Mara — salary (teacher)', amount: 3150 },
  { source: 'Dev — salary (electrician)', amount: 2050 },
  { source: 'Dev — weekend call-outs', amount: 450 },
  { source: 'Interest & refunds', amount: 200 },
];

export const MONTHS = [
  { month: 'Jun', spent: 4810 },
  { month: 'Jul', spent: 5230 },
  { month: 'Aug', spent: 4990 },
  { month: 'Sep', spent: 5120 },
  { month: 'Oct', spent: 5340 },
  { month: 'Nov', spent: 4225 },
];

export const CATEGORIES = [
  { name: 'Housing', budget: 1650, spent: 1650, note: 'Mortgage + insurance' },
  { name: 'Groceries', budget: 700, spent: 620, note: 'Weekly shop, 4 trips so far' },
  { name: 'Transport', budget: 380, spent: 310, note: 'Fuel + bus passes' },
  { name: 'Utilities', budget: 260, spent: 240, note: 'Electric, water, internet, phones' },
  { name: 'Dining out', budget: 220, spent: 180, note: 'Two takeaways, one restaurant' },
  { name: 'Entertainment', budget: 150, spent: 95, note: 'Streaming + cinema trip' },
  { name: 'Clothing', budget: 120, spent: 60, note: 'Winter coats for the kids' },
  { name: 'Health', budget: 200, spent: 130, note: 'Pharmacy + dentist check-up' },
  { name: 'Savings', budget: 800, spent: 800, note: 'Moved to savings on payday' },
  { name: 'Everything else', budget: 150, spent: 140, note: 'Gifts, school bits, odds and ends' },
];

export const EXPENSES = [
  { date: '28 Nov', merchant: 'GreenMart supermarket', category: 'Groceries', amount: 96.40 },
  { date: '27 Nov', merchant: 'City Bus — monthly passes', category: 'Transport', amount: 84.00 },
  { date: '26 Nov', merchant: 'Riverside Pharmacy', category: 'Health', amount: 22.50 },
  { date: '25 Nov', merchant: 'Pasta Pronto (takeaway)', category: 'Dining out', amount: 31.80 },
  { date: '24 Nov', merchant: 'Northbank Electric', category: 'Utilities', amount: 118.00 },
  { date: '22 Nov', merchant: 'GreenMart supermarket', category: 'Groceries', amount: 142.75 },
  { date: '21 Nov', merchant: 'Cinema — family tickets', category: 'Entertainment', amount: 46.00 },
  { date: '20 Nov', merchant: 'Fuel — Route 9 station', category: 'Transport', amount: 58.20 },
  { date: '19 Nov', merchant: 'Kids coats — Market St', category: 'Clothing', amount: 60.00 },
  { date: '17 Nov', merchant: 'GreenMart supermarket', category: 'Groceries', amount: 128.30 },
  { date: '15 Nov', merchant: 'Dentist — Leo check-up', category: 'Health', amount: 45.00 },
  { date: '14 Nov', merchant: 'Pasta Pronto (takeaway)', category: 'Dining out', amount: 28.40 },
  { date: '12 Nov', merchant: 'Water bill', category: 'Utilities', amount: 64.50 },
  { date: '10 Nov', merchant: 'GreenMart supermarket', category: 'Groceries', amount: 119.60 },
  { date: '08 Nov', merchant: 'School trip — Sofia', category: 'Everything else', amount: 38.00 },
  { date: '05 Nov', merchant: 'Internet + phones', category: 'Utilities', amount: 57.50 },
  { date: '03 Nov', merchant: 'Streaming services', category: 'Entertainment', amount: 29.00 },
  { date: '01 Nov', merchant: 'Mortgage payment', category: 'Housing', amount: 1450.00 },
  { date: '01 Nov', merchant: 'Home insurance', category: 'Housing', amount: 200.00 },
  { date: '01 Nov', merchant: 'Transfer to savings', category: 'Savings', amount: 800.00 },
];

export const GOALS = [
  { name: 'Emergency fund', target: 6000, saved: 4250, note: 'Three months of essentials' },
  { name: 'Summer holiday', target: 2400, saved: 1100, note: 'Two weeks by the coast, July' },
  { name: 'Replace the car', target: 12000, saved: 3600, note: 'The old hatchback is on its last legs' },
  { name: 'Kitchen renovation', target: 5000, saved: 850, note: 'New worktops and a proper oven' },
];

export const BILLS = [
  { name: 'Mortgage', amount: 1450, due: '1st', status: 'Paid' },
  { name: 'Home insurance', amount: 200, due: '1st', status: 'Paid' },
  { name: 'Electric', amount: 118, due: '24th', status: 'Paid' },
  { name: 'Water', amount: 64.50, due: '12th', status: 'Paid' },
  { name: 'Internet + phones', amount: 57.50, due: '5th', status: 'Paid' },
  { name: 'Streaming', amount: 29, due: '3rd', status: 'Paid' },
  { name: 'Gym (Mara)', amount: 32, due: '15th', status: 'Due 15 Dec' },
];

export function totalIncome() {
  return INCOME.reduce((sum, i) => sum + i.amount, 0);
}

export function totalBudget() {
  return CATEGORIES.reduce((sum, c) => sum + c.budget, 0);
}

export function totalSpent() {
  return CATEGORIES.reduce((sum, c) => sum + c.spent, 0);
}

export function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function moneyCents(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// The 50/30/20 rule: 50% needs, 30% wants, 20% savings — the split the
// calculator page works out from any monthly income.
export function fiftyThirtyTwenty(income) {
  return {
    needs: Math.round(income * 0.5),
    wants: Math.round(income * 0.3),
    savings: Math.round(income * 0.2),
  };
}
