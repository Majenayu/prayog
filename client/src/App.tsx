import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import IndustryDashboard from "@/pages/industry-dashboard";
import ExchangesPage from "@/pages/exchanges";
import RepairsPage from "@/pages/repairs";
import ManageMachineParts from "@/pages/manage-machine-parts";
import PartDiagram from "@/pages/part-diagram";
import MachineBuilder from "@/pages/machine-builder";
import MachinesPage from "@/pages/machines";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRole }: { component: any; allowedRole?: string }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Redirect to={user.role === 'industry' ? '/industry' : '/dashboard'} />;
  }
  
  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {user ? (
          <Redirect to={user.role === 'industry' ? '/industry' : '/dashboard'} />
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} allowedRole="user" />
      </Route>
      
      <Route path="/exchanges">
        <ProtectedRoute component={ExchangesPage} />
      </Route>
      
      <Route path="/repairs">
        <ProtectedRoute component={RepairsPage} />
      </Route>
      
      <Route path="/industry">
        <ProtectedRoute component={IndustryDashboard} allowedRole="industry" />
      </Route>
      
      <Route path="/industry/machine-parts">
        <ProtectedRoute component={ManageMachineParts} allowedRole="industry" />
      </Route>
      
      <Route path="/industry/machines">
        <ProtectedRoute component={MachineBuilder} allowedRole="industry" />
      </Route>
      
      <Route path="/machines/:id">
        <ProtectedRoute component={MachinesPage} />
      </Route>
      
      <Route path="/machines">
        <ProtectedRoute component={MachinesPage} />
      </Route>
      
      <Route path="/parts/:itemId">
        <ProtectedRoute component={PartDiagram} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="renthub-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
