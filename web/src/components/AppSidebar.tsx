import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  CheckSquare,
  FileText,
  Camera,
  Settings,
  Home,
  Wallet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/clerk-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useMe } from "@/hooks/useMe";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

const adminNavItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/capital", label: "Capital", icon: TrendingUp },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "#equity", label: "Equity", icon: PieChart, comingSoon: true },
  { to: "#tasks", label: "Tasks", icon: CheckSquare, comingSoon: true },
  { to: "#reports", label: "Reports", icon: FileText, comingSoon: true },
];

const secondaryItems: NavItem[] = [
  { to: "/receipts", label: "Receipts", icon: Camera },
  { to: "/settings", label: "Settings", icon: Settings },
];

const founderMobileTabItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/capital", label: "Capital", icon: Wallet },
  { to: "/receipts", label: "Capture", icon: Camera, highlight: true },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];

const adminMobileTabItems = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/capital", label: "Capital", icon: TrendingUp },
  { to: "/receipts", label: "Capture", icon: Camera, highlight: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Routes each role is allowed to see */
const adminOrOwnerRoutes = new Set(["/", "/capital", "/expenses", "/receipts", "/settings", "/myportal"]);
const memberRoutes = new Set(["/myportal", "/receipts", "/expenses"]);
const viewerRoutes = new Set(["/myportal", "/receipts"]);

function getAllowedRoutes(role: string | undefined): Set<string> {
  switch (role) {
    case "owner":
    case "admin":
      return adminOrOwnerRoutes;
    case "member":
      return memberRoutes;
    case "viewer":
      return viewerRoutes;
    default:
      return viewerRoutes;
  }
}

export function AppSidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const { isFounder, isNativeApp } = useViewMode();
  const { user } = useUser();
  const { data: me } = useMe();

  const [bouncing, setBouncing] = useState(false);
  const isAdminRole = me?.role === "owner" || me?.role === "admin";

  const allowedRoutes = useMemo(() => getAllowedRoutes(me?.role), [me?.role]);

  const filteredAdminNavItems = useMemo(
    () => adminNavItems.filter((item) => item.comingSoon || allowedRoutes.has(item.to)),
    [allowedRoutes],
  );

  const filteredSecondaryItems = useMemo(
    () => secondaryItems.filter((item) => allowedRoutes.has(item.to)),
    [allowedRoutes],
  );

  const baseMobileTabItems = isFounder ? founderMobileTabItems : adminMobileTabItems;
  const mobileTabItems = useMemo(
    () => baseMobileTabItems.filter((item) => allowedRoutes.has(item.to)),
    [baseMobileTabItems, allowedRoutes],
  );

  // Bounce the sidebar indicator every 10 seconds when not hovered
  useEffect(() => {
    if (isFounder || !isAdminRole) return;
    const interval = setInterval(() => {
      if (!hovered) {
        setBouncing(true);
        setTimeout(() => setBouncing(false), 1000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [hovered, isFounder, isAdminRole]);

  return (
    <>
      {/* Desktop: invisible trigger strip + sliding sidebar — admin/owner only */}
      {!isFounder && isAdminRole && (
        <div
          className="hidden md:block fixed left-0 top-0 h-full z-50"
          style={{ width: hovered ? 272 : 16 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <div
              className={cn(
                "h-14 bg-primary rounded-r-full transition-opacity duration-300 flex items-center justify-end pr-1",
                hovered ? "opacity-0" : "opacity-100",
              )}
              style={{
                width: 14,
                ...(bouncing && !hovered ? {
                  animation: "sidebarBounce 1s ease-in-out",
                } : {}),
              }}
            >
              <div className="w-1.5 h-7 bg-primary-foreground/40 rounded-full" />
            </div>
          </div>

          <div
            className={cn(
              "w-[260px] h-full p-3 pr-0 transition-transform duration-300 ease-in-out",
              hovered ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <aside className="flex flex-col w-full bg-card rounded-2xl shadow-xl shadow-primary/10 border border-border/50 h-[calc(100vh-24px)] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-xs">FS</span>
                </div>
                <span className="font-semibold text-foreground text-sm tracking-tight">FounderStack</span>
              </div>

              <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
                {filteredAdminNavItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.comingSoon ? "#" : item.to}
                      onClick={(e) => item.comingSoon && e.preventDefault()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : item.comingSoon
                          ? "text-muted-foreground/40 cursor-not-allowed"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.comingSoon && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}

                {filteredAdminNavItems.length > 0 && filteredSecondaryItems.length > 0 && (
                  <Separator className="my-3 bg-border/50" />
                )}

                {filteredSecondaryItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border/50 px-5 py-4">
                <p className="text-xs font-medium text-foreground truncate">{user?.firstName ? `${user.firstName}'s Workspace` : "My Workspace"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Plan: Free</p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2 safe-area-bottom">
        <div className="flex items-center justify-around h-14 bg-card rounded-2xl shadow-lg shadow-primary/10 border border-border/50">
          {mobileTabItems.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.highlight ? (
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center -mt-4 shadow-lg shadow-primary/30">
                    <tab.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : (
                  <tab.icon className="w-5 h-5" />
                )}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
