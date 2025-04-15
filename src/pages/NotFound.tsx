import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Film, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container flex flex-col items-center justify-center h-[70vh] px-4 text-center">
        <Film className="h-16 w-16 text-film-primary mb-6" />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This scene isn't in our film collection
        </p>
        <Button className="bg-film-primary hover:bg-film-primary/90 text-white" asChild>
          <a href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Main Feature
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
