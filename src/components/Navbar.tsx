import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Stethoscope, Syringe, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  // Helper component to render the navigation item conditionally
  const NavItem = ({ hash, icon: Icon, label }: { hash: string, icon: React.ElementType, label: string }) => {
    const navLinkClass = "flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
    
    // The destination is just the hash on the homepage, or the homepage path with the hash otherwise.
    const dest = isHomePage ? hash : `/${hash}`;

    // On the homepage, use an anchor tag (<a>) for smooth in-page scrolling.
    // On other pages, use Link (from react-router-dom) to navigate to the home page.
    const Component = isHomePage ? 'a' : Link;
    const props = isHomePage ? { href: hash } : { to: dest };

    return (
        <Component {...props} className={navLinkClass}>
            <Icon className="h-4 w-4" />
            {label}
        </Component>
    );
  };
    
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-lg transition-transform group-hover:scale-110">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
            PetCare Pro
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <NavItem hash="#shop" icon={ShoppingBag} label="Pet Shop" />
          <NavItem hash="#services" icon={Stethoscope} label="Vet Services" />
          <NavItem hash="#vaccination" icon={Syringe} label="Vaccination" />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link to="/vet-auth">
                <Button variant="hero" size="sm">
                  Vet Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};