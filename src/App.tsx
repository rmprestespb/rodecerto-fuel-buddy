import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewRecord from "./pages/NewRecord";
import History from "./pages/History";
import Vehicles from "./pages/Vehicles";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import Upgrade from "./pages/Upgrade";
import OilChanges from "./pages/OilChanges";
import NewOilChange from "./pages/NewOilChange";
import FuelCalculator from "./pages/FuelCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-record" element={<NewRecord />} />
            <Route path="/history" element={<History />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/map" element={<Map />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/oil-changes" element={<OilChanges />} />
            <Route path="/new-oil-change" element={<NewOilChange />} />
            <Route path="/calculator" element={<FuelCalculator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
