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
import { Plus, Calendar } from "lucide-react"; // Removed Video, PhoneCall

// Removed: generateRoomId utility

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes: string;
  // Removed: video_call_url property
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

  const createBooking = async (data: typeof formData) => { // Removed isEmergency parameter
    // Removed all emergency/video logic
    
    // Client-side validation to prevent sending empty strings to NOT NULL DB columns is kept here
    // but also handled in handleSubmit, making data safe.

    const { error } = await supabase.from("vet_bookings").insert({
        user_id: userId,
        pet_id: data.pet_id,
        service_type: data.service_type,
        scheduled_date: data.scheduled_date,
        notes: data.notes,
        // Removed: video_call_url field
    });

    if (error) {
      // Log error details for debugging
      console.error("Supabase Error creating booking:", error.message, error.details);
      toast({ title: "Error creating booking", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking created successfully!" }); // Simplified toast message
      setOpen(false);
      setFormData({ pet_id: "", service_type: "", scheduled_date: "", notes: "" });
      fetchBookings();
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit client-side validation to ensure all required fields are present
    if (!formData.pet_id) {
        toast({ title: "Validation Failed", description: "Please select a pet.", variant: "destructive" });
        return;
    }
    if (!formData.service_type.trim()) {
        toast({ title: "Validation Failed", description: "Please enter a service type.", variant: "destructive" });
        return;
    }
    if (!formData.scheduled_date) {
        toast({ title: "Validation Failed", description: "Please select a date and time.", variant: "destructive" });
        return;
    }
    
    createBooking(formData);
  };

  // Removed: handleEmergencyConsult

  // Removed: isEmergencyConsult utility

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <div className="flex gap-2">
          {/* Removed: Emergency Consult Button */}
          
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
                  <Select value={formData.pet_id} onValueChange={(value) => setFormData({ ...formData, pet_id: value })} required>
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
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}> {/* Removed conditional className */}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> {/* Use Calendar icon always */}
                    {booking.service_type}
                </span>
                {/* Removed: Join Call button logic */}
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