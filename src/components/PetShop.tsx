import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast";

const products = [
  {
    id: 1,
    name: "Premium Dog Food",
    price: 45.99,
    category: "Food",
    image: "🦴", // Fixed: Bone/Food emoji
  },
  {
    id: 2,
    name: "Cat Scratching Post",
    price: 29.99,
    category: "Toys",
    image: "🐈", // Fixed: Cat emoji
  },
  {
    id: 3,
    name: "Pet Carrier Bag",
    price: 39.99,
    category: "Accessories",
    image: "👜", // Fixed: Carrier/Bag emoji
  },
  {
    id: 4,
    name: "Dental Care Kit",
    price: 24.99,
    category: "Healthcare",
    image: "🦷", // Fixed: Tooth emoji
  },
  {
    id: 5,
    name: "Interactive Pet Toy",
    price: 19.99,
    category: "Toys",
    image: "🎾", // Fixed: Tennis Ball emoji
  },
  {
    id: 6,
    name: "Grooming Kit",
    price: 34.99,
    category: "Grooming",
    image: "🛁", // Fixed: Bathtub/Grooming emoji
  },
];

export const PetShop = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (product: typeof products[0]) => {
    if (!user) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
      quantity: 1
    });

    if (error) {
      toast({ title: "Error adding to cart", variant: "destructive" });
    } else {
      toast({
        title: "Added to cart successfully!",
        action: (
          <ToastAction 
            altText="View your shopping cart" 
            onClick={() => navigate("/owner-dashboard?tab=cart")}
          >
            View Cart
          </ToastAction>
        )
      });
    }
  };
  return (
    <section id="shop" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pet Shop
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium quality products for your beloved pets. From nutrition to toys, we have everything.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-card to-muted/20"
            >
              <div className="text-6xl mb-4 text-center">{product.image}</div>
              <div className="space-y-3">
                <div className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                  <Button size="sm" className="gap-2" onClick={() => addToCart(product)}>
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};