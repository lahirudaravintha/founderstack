import { useViewMode } from "@/contexts/ViewModeContext";
import { useMe } from "@/hooks/useMe";
import { cn } from "@/lib/utils";
import { Shield, User } from "lucide-react";

export function ViewToggle() {
  const { mode, setMode, isNativeApp } = useViewMode();
  const { data: me } = useMe();

  // Hide toggle on native — always founder mode
  if (isNativeApp) return null;

  // Hide toggle for members and viewers — they only see founder mode
  if (me && me.role !== "owner" && me.role !== "admin") return null;

  return (
    <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
      <button
        onClick={() => setMode("admin")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
          mode === "admin"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Shield className="w-3.5 h-3.5" />
        Admin
      </button>
      <button
        onClick={() => setMode("founder")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
          mode === "founder"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="w-3.5 h-3.5" />
        Founder
      </button>
    </div>
  );
}
