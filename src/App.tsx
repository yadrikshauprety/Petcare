import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VetAuth from "./pages/VetAuth";
import NotFound from "./pages/NotFound";
import OwnerDashboard from "./pages/OwnerDashboard";
import VetDashboard from "./pages/VetDashboard";
import Checkout from "./pages/Checkout";
import React from "react";

const queryClient = new QueryClient();

// New component to handle scrolling logic
const ScrollToTopOrHash = () => {
  const { pathname, hash, key } = useLocation();

  React.useEffect(() => {
    // If a hash exists (e.g., #shop), try to scroll to that element.
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Use a slight delay to ensure content has finished rendering after navigation
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // Otherwise, scroll to the top of the page.
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]); // Re-run effect on route change

  return null;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTopOrHash /> {/* Add the new scroll handler here */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/vet-auth" element={<VetAuth />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;