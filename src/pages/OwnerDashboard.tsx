import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetManagement } from "@/components/dashboard/PetManagement";
import { MyCart } from "@/components/dashboard/MyCart";
import { MyBookings } from "@/components/dashboard/MyBookings";
import { ChatWithVet } from "@/components/dashboard/ChatWithVet";
import { User } from "@supabase/supabase-js";

const OwnerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
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
        <h1 className="text-3xl font-bold mb-8">Pet Owner Dashboard</h1>
        
        <Tabs defaultValue="pets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="cart">Shopping Cart</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="chat">Chat with Vet</TabsTrigger>
          </TabsList>

          <TabsContent value="pets">
            <PetManagement userId={user.id} />
          </TabsContent>

          <TabsContent value="cart">
            <MyCart userId={user.id} />
          </TabsContent>

          <TabsContent value="bookings">
            <MyBookings userId={user.id} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatWithVet userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
