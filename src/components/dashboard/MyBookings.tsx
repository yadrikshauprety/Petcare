import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar } from "lucide-react";

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes: string;
}

interface Pet {
  id: string;
  name: string;
}

export const MyBookings = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: "",
    service_type: "",
    scheduled_date: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchPets();
  }, [userId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("vet_bookings")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching bookings", variant: "destructive" });
    } else {
      setBookings(data || []);
    }
  };

  const fetchPets = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name")
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error fetching pets", variant: "destructive" });
    } else {
      setPets(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("vet_bookings").insert({
      user_id: userId,
      pet_id: formData.pet_id,
      service_type: formData.service_type,
      scheduled_date: formData.scheduled_date,
      notes: formData.notes
    });

    if (error) {
      toast({ title: "Error creating booking", variant: "destructive" });
    } else {
      toast({ title: "Booking created successfully!" });
      setOpen(false);
      setFormData({ pet_id: "", service_type: "", scheduled_date: "", notes: "" });
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Vet Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pet">Select Pet</Label>
                <Select value={formData.pet_id} onValueChange={(value) => setFormData({ ...formData, pet_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="e.g., Checkup, Vaccination"
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduled_date">Date & Time</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes or concerns"
                />
              </div>
              <Button type="submit" className="w-full">Book Appointment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {booking.service_type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(booking.scheduled_date).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Status: <span className="font-semibold">{booking.status}</span></p>
              {booking.notes && <p className="text-sm mt-2">{booking.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
