import { BrowserRouter, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ViewModeProvider } from "./contexts/ViewModeContext";
import { ExpenseCategoriesProvider } from "./contexts/ExpenseCategoriesContext";
import { useMe } from "./hooks/useMe";
import Dashboard from "./pages/Dashboard";
import CapitalPage from "./pages/CapitalPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import SettingsPage from "./pages/SettingsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const location = useLocation();

  // Still loading user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // User has no company and isn't already on onboarding page
  if (me && !me.companyId && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // User already has a company but is on onboarding page — send to dashboard
  if (me && me.companyId && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ClerkWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ViewModeProvider>
          <ExpenseCategoriesProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingGate><OnboardingPage /></OnboardingGate>
                </ProtectedRoute>
              } />

              {/* Protected routes — require auth + company */}
              <Route path="/" element={<ProtectedRoute><OnboardingGate><Dashboard /></OnboardingGate></ProtectedRoute>} />
              <Route path="/capital" element={<ProtectedRoute><OnboardingGate><CapitalPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><OnboardingGate><ExpensesPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/receipts" element={<ProtectedRoute><OnboardingGate><ReceiptsPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><OnboardingGate><SettingsPage /></OnboardingGate></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ExpenseCategoriesProvider>
        </ViewModeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const App = () => (
  <BrowserRouter>
    <ClerkWithRoutes />
    <Toaster position="top-right" closeButton richColors />
  </BrowserRouter>
);

export default App;
