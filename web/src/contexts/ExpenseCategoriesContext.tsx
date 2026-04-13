import { createContext, useContext, useState, type ReactNode } from "react";
import {
  Monitor,
  Cpu,
  Plane,
  Building2,
  Megaphone,
  Scale,
  Package,
  Palette,
  Wrench,
  BarChart3,
  Car,
  UtensilsCrossed,
  Smartphone,
  Cloud,
  GraduationCap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export interface ExpenseCategoryItem {
  id: string;
  name: string;
  icon: string; // lucide icon key
}

// Map of icon key → Lucide component
export const categoryIconMap: Record<string, LucideIcon> = {
  monitor: Monitor,
  cpu: Cpu,
  plane: Plane,
  building: Building2,
  megaphone: Megaphone,
  scale: Scale,
  package: Package,
  palette: Palette,
  wrench: Wrench,
  chart: BarChart3,
  car: Car,
  food: UtensilsCrossed,
  phone: Smartphone,
  cloud: Cloud,
  education: GraduationCap,
  lightbulb: Lightbulb,
};

export const iconOptions = Object.keys(categoryIconMap);

export function getCategoryIcon(key: string): LucideIcon {
  return categoryIconMap[key] || Package;
}

const defaultCategories: ExpenseCategoryItem[] = [
  { id: 'cat-1', name: 'Software', icon: 'monitor' },
  { id: 'cat-2', name: 'Hardware', icon: 'cpu' },
  { id: 'cat-3', name: 'Travel', icon: 'plane' },
  { id: 'cat-4', name: 'Office', icon: 'building' },
  { id: 'cat-5', name: 'Marketing', icon: 'megaphone' },
  { id: 'cat-6', name: 'Legal', icon: 'scale' },
  { id: 'cat-7', name: 'Other', icon: 'package' },
];

interface ExpenseCategoriesContextType {
  categories: ExpenseCategoryItem[];
  addCategory: (name: string, icon: string) => void;
  updateCategory: (id: string, name: string, icon: string) => void;
  removeCategory: (id: string) => void;
}

const ExpenseCategoriesContext = createContext<ExpenseCategoriesContextType | undefined>(undefined);

export function ExpenseCategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(defaultCategories);

  const addCategory = (name: string, icon: string) => {
    setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, name, icon }]);
  };

  const updateCategory = (id: string, name: string, icon: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, icon } : c)));
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ExpenseCategoriesContext.Provider value={{ categories, addCategory, updateCategory, removeCategory }}>
      {children}
    </ExpenseCategoriesContext.Provider>
  );
}

export function useExpenseCategories() {
  const ctx = useContext(ExpenseCategoriesContext);
  if (!ctx) throw new Error("useExpenseCategories must be used within ExpenseCategoriesProvider");
  return ctx;
}
