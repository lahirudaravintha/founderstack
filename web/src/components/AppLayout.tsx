import { AppSidebar } from "@/components/AppSidebar";
import { ViewToggle } from "@/components/ViewToggle";
import { FounderPortal } from "@/components/FounderPortal";
import { MobileFounderHome } from "@/components/mobile/MobileFounderHome";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser, UserButton } from "@clerk/clerk-react";

interface AppLayoutProps {
  children: React.ReactNode;
  founderContent?: React.ReactNode;
  title?: string;
  founderTitle?: string;
}

export function AppLayout({ children, founderContent, title, founderTitle }: AppLayoutProps) {
  const { isFounder, isNativeApp } = useViewMode();
  const isMobile = useIsMobile();
  const { user } = useUser();
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.primaryEmailAddress?.emailAddress || "User" : "User";

  // On native or mobile founder view, use a streamlined layout
  const showMobileFounder = isFounder && (isNativeApp || isMobile);

  return (
    <div className="min-h-screen bg-background">
      {!isFounder && <AppSidebar />}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 max-w-[1200px] mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              {isFounder && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground font-bold text-xs">FS</span>
                  </div>
                  <span className="font-semibold text-foreground text-sm tracking-tight hidden sm:inline">FounderStack</span>
                </div>
              )}
              {!showMobileFounder && (
                <h1 className="text-lg font-semibold text-foreground">{isFounder ? (founderTitle || "My Portal") : title}</h1>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ViewToggle />
              {!showMobileFounder && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                  </div>
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 max-w-[1200px] mx-auto">
          {isFounder
            ? (showMobileFounder ? <MobileFounderHome /> : (founderContent || <FounderPortal />))
            : children}
        </div>
      </main>
    </div>
  );
}
