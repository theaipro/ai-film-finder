
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./context/ProfileContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Mood from "./pages/Mood";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";
import AIFloatingChat from "./components/AIChat/AIFloatingChat";

// Create a new query client instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <TooltipProvider>
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mood" element={<Mood />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIFloatingChat />
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
};

export default App;
