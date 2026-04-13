import { createContext, useContext, useState, type ReactNode } from "react";
import { isNative } from "@/lib/platform";

type ViewMode = "admin" | "founder";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  isAdmin: boolean;
  isFounder: boolean;
  isNativeApp: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  // On native mobile, always founder mode
  const [mode, setMode] = useState<ViewMode>(isNative ? "founder" : "admin");

  const handleSetMode = (newMode: ViewMode) => {
    // Prevent switching to admin on native
    if (isNative) return;
    setMode(newMode);
  };

  return (
    <ViewModeContext.Provider value={{
      mode,
      setMode: handleSetMode,
      isAdmin: mode === "admin",
      isFounder: mode === "founder",
      isNativeApp: isNative,
    }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}
