import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  weight: number;
}

export const PetManagement = ({ userId }: { userId: string }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    date_of_birth: "",
    weight: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPets();
  }, [userId]);

  const fetchPets = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error fetching pets", variant: "destructive" });
    } else {
      setPets(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("pets").insert({
      user_id: userId,
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      date_of_birth: formData.date_of_birth,
      weight: parseFloat(formData.weight)
    });

    if (error) {
      toast({ title: "Error adding pet", variant: "destructive" });
    } else {
      toast({ title: "Pet added successfully!" });
      setOpen(false);
      setFormData({ name: "", species: "", breed: "", date_of_birth: "", weight: "" });
      fetchPets();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Pets</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Add Pet</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <CardHeader>
              <CardTitle>{pet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Species: {pet.species}</p>
              <p className="text-sm text-muted-foreground">Breed: {pet.breed}</p>
              <p className="text-sm text-muted-foreground">Weight: {pet.weight} kg</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
