// Mock data matching the FounderStack UI spec

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  defaultCurrency: string;
  plan: string;
  createdAt: string;
}

export type ContributionCategory = 'Cash' | 'Equipment' | 'Services' | 'IP' | 'Real Estate' | 'Other';

export interface CapitalContribution {
  id: string;
  userId: string;
  userName: string;
  category: ContributionCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  notes?: string;
  hasReceipt: boolean;
}

export interface Receipt {
  id: string;
  vendor: string;
  amount: number | null;
  currency: string;
  date: string | null;
  status: 'confirmed' | 'needs_review';
  thumbnailUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  modules: string[];
  isCurrentUser?: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
}

// Current user
export const currentUser: User = {
  id: '1',
  name: 'Lahiru',
  email: 'lahiru@rooster.org',
  role: 'owner',
};

export const workspace: Workspace = {
  id: 'ws-1',
  name: 'Rooster Labs',
  defaultCurrency: 'USD',
  plan: 'Free',
  createdAt: '2026-01-15',
};

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Lahiru', email: 'lahiru@rooster.org', role: 'owner', modules: ['All'], isCurrentUser: true },
  { id: '2', name: 'Sarah Chen', email: 'sarah@founderstack.co', role: 'admin', modules: ['All'] },
  { id: '3', name: 'Alex Rivera', email: 'alex@founderstack.co', role: 'member', modules: ['Capital', 'Expenses'] },
];

export const capitalContributions: CapitalContribution[] = [
  { id: 'c1', userId: '1', userName: 'Lahiru', category: 'Cash', amount: 50000, currency: 'USD', date: '2026-03-15', description: 'Initial seed investment from personal savings', hasReceipt: true },
  { id: 'c2', userId: '1', userName: 'Lahiru', category: 'Cash', amount: 10000, currency: 'USD', date: '2026-04-10', description: 'Additional cash investment', hasReceipt: true },
  { id: 'c3', userId: '2', userName: 'Sarah', category: 'Equipment', amount: 5000, currency: 'USD', date: '2026-04-08', description: 'MacBook Pro for development', hasReceipt: false },
  { id: 'c4', userId: '3', userName: 'Alex', category: 'Services', amount: 2500, currency: 'USD', date: '2026-04-01', description: 'Legal consultation and incorporation', hasReceipt: false },
];

export const receipts: Receipt[] = [
  { id: 'r1', vendor: 'Staples', amount: 125.99, currency: 'USD', date: '2026-04-10', status: 'confirmed' },
  { id: 'r2', vendor: 'Amazon', amount: 89.00, currency: 'USD', date: '2026-04-08', status: 'confirmed' },
  { id: 'r3', vendor: 'Unknown vendor', amount: null, currency: 'USD', date: null, status: 'needs_review' },
  { id: 'r4', vendor: 'Uber', amount: 24.50, currency: 'USD', date: '2026-04-01', status: 'confirmed' },
];

export const invitations: Invitation[] = [
  { id: 'i1', email: 'pending@example.com', role: 'member', status: 'pending', sentAt: '2026-04-05' },
];

export const contributionCategories: ContributionCategory[] = ['Cash', 'Equipment', 'Services', 'IP', 'Real Estate', 'Other'];
// Full list of world currencies with display names
export const currencyList: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TWD', name: 'Taiwan Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'MAD', name: 'Moroccan Dirham' },
  { code: 'TZS', name: 'Tanzanian Shilling' },
  { code: 'UGX', name: 'Ugandan Shilling' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ARS', name: 'Argentine Peso' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'COP', name: 'Colombian Peso' },
  { code: 'PEN', name: 'Peruvian Sol' },
  { code: 'UYU', name: 'Uruguayan Peso' },
  { code: 'BOB', name: 'Bolivian Boliviano' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'HRK', name: 'Croatian Kuna' },
  { code: 'ISK', name: 'Icelandic Krona' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'GEL', name: 'Georgian Lari' },
  { code: 'AMD', name: 'Armenian Dram' },
  { code: 'JMD', name: 'Jamaican Dollar' },
  { code: 'TTD', name: 'Trinidad Dollar' },
  { code: 'FJD', name: 'Fijian Dollar' },
  { code: 'XOF', name: 'West African CFA Franc' },
  { code: 'XAF', name: 'Central African CFA Franc' },
];

// Short code-only list for backward compatibility
export const currencies = currencyList.map(c => c.code);

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function getTotalCapital(): number {
  return capitalContributions.reduce((sum, c) => sum + c.amount, 0);
}

export function getThisMonthCapital(): number {
  return capitalContributions
    .filter(c => c.date.startsWith('2026-04'))
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getContributorCount(): number {
  return new Set(capitalContributions.map(c => c.userId)).size;
}

// Timeline data for the chart — cumulative per contributor per month
export function getCapitalTimelineData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  return months.map((month, i) => {
    const monthStr = `2026-${String(i + 1).padStart(2, '0')}`;
    const lahiru = capitalContributions
      .filter(c => c.userName === 'Lahiru' && c.date <= `${monthStr}-31`)
      .reduce((s, c) => s + c.amount, 0);
    const sarah = capitalContributions
      .filter(c => c.userName === 'Sarah' && c.date <= `${monthStr}-31`)
      .reduce((s, c) => s + c.amount, 0);
    const alex = capitalContributions
      .filter(c => c.userName === 'Alex' && c.date <= `${monthStr}-31`)
      .reduce((s, c) => s + c.amount, 0);
    return { month, Lahiru: lahiru, Sarah: sarah, Alex: alex };
  });
}
