import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Alerts from "./pages/Alerts";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/machines" component={Machines} />
      <Route path="/machines/:id" component={MachineDetail} />
      <Route path="/alerts" component={Alerts} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
