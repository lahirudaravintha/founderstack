export const MODULES = {
  capital: { id: "capital", name: "Capital Tracking", description: "Track founder capital contributions" },
  expenses: { id: "expenses", name: "Expense Tracking", description: "Track business expenses" },
  equity: { id: "equity", name: "Equity & Ownership", description: "Track ownership percentages and vesting" },
  tasks: { id: "tasks", name: "Task Management", description: "Assign and track work" },
  revenue: { id: "revenue", name: "Revenue Tracking", description: "Record and categorize income" },
  reports: { id: "reports", name: "Financial Reports", description: "Dashboards, P&L, burn rate" },
} as const;

export type ModuleId = keyof typeof MODULES;
