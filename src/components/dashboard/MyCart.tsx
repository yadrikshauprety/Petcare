import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
}

export const MyCart = ({ userId }: { userId: string }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  const fetchCartItems = async () => {
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

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({ title: "Error removing item", variant: "destructive" });
    } else {
      toast({ title: "Item removed from cart" });
      fetchCartItems();
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shopping Cart</h2>
        <ShoppingCart className="h-6 w-6" />
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Your cart is empty
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">${(item.product_price * item.quantity).toFixed(2)}</p>
                    <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Total:</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
