import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

const Checkout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchCartItems(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchCartItems = async (userId: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error fetching cart", variant: "destructive" });
    } else {
      setCartItems(data || []);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast({ title: "Please enter shipping address", variant: "destructive" });
      return;
    }

    if (!user) return;

    const { error: orderError } = await supabase.from("orders").insert([{
      user_id: user.id,
      total_amount: total,
      shipping_address: address,
      items: JSON.parse(JSON.stringify(cartItems))
    }]);

    if (orderError) {
      toast({ title: "Error creating order", variant: "destructive" });
      return;
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      toast({ title: "Error clearing cart", variant: "destructive" });
      return;
    }

    toast({ title: "Order placed successfully!" });
    navigate("/owner-dashboard");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>{item.product_name} x {item.quantity}</span>
                <span>${(item.product_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete shipping address"
                rows={4}
              />
            </div>
            <Button onClick={handleCheckout} className="w-full" size="lg">
              Place Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
