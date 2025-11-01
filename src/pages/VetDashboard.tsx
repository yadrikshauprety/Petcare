import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageBookings } from "@/components/vet/ManageBookings";
import { VetChat } from "@/components/vet/VetChat";
import { User } from "@supabase/supabase-js";

const VetDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/vet-auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/vet-auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Veterinarian Dashboard</h1>
        
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="chat">Chat with Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <ManageBookings vetId={user.id} />
          </TabsContent>

          <TabsContent value="chat">
            <VetChat vetId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VetDashboard;
