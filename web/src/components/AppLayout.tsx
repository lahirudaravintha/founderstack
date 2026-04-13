import { AppSidebar } from "@/components/AppSidebar";
import { ViewToggle } from "@/components/ViewToggle";
import { useUser, UserButton } from "@clerk/clerk-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user } = useUser();
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.primaryEmailAddress?.emailAddress || "User" : "User";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 max-w-[1200px] mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ViewToggle />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                </div>
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
