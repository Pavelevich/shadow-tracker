import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import MevShield from "./pages/MevShield";
import DustCleanerPage from "./pages/DustCleanerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home - Tool Selection */}
          <Route path="/" element={<Home />} />

          {/* Privacy Analyzer */}
          <Route path="/analyze" element={<Navigate to="/" replace />} />
          <Route path="/analyze/:wallet" element={<Index />} />

          {/* MEV Shield */}
          <Route path="/mev" element={<MevShield />} />
          <Route path="/mev/:wallet" element={<MevShield />} />

          {/* Dust Cleaner */}
          <Route path="/dust" element={<DustCleanerPage />} />
          <Route path="/dust/:wallet" element={<DustCleanerPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
