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
import { Plus, Calendar, Video, PhoneCall } from "lucide-react";

// Utility to generate a unique room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4, 9);


interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes: string;
  video_call_url: string; 
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

  const createBooking = async (data: typeof formData, isEmergency = false) => {
    let videoUrl = null;
    let scheduledDate = data.scheduled_date;
    let serviceType = data.service_type;

    if (isEmergency) {
        // For an emergency, set the date immediately and generate a URL
        const now = new Date();
        // Set the service type to clearly identify it
        serviceType = "Emergency Video Consult"; 
        // Use the current time for the booking, rounded to the minute for consistency
        scheduledDate = now.toISOString().substring(0, 16); 
        // Mock a unique video call URL. The vet will use this or update it.
        videoUrl = `https://petcare.pro/call/${generateRoomId()}`;
    }

    const { error } = await supabase.from("vet_bookings").insert({
        user_id: userId,
        // Default to the first pet if not selected, or require selection for normal bookings
        pet_id: data.pet_id || (pets.length > 0 ? pets[0].id : null),
        service_type: serviceType,
        scheduled_date: scheduledDate,
        notes: data.notes,
        video_call_url: videoUrl,
    });

    if (error) {
      toast({ title: "Error creating booking", variant: "destructive" });
    } else {
      toast({ title: isEmergency ? "Emergency Consult Requested! A vet will confirm soon." : "Booking created successfully!" });
      setOpen(false);
      setFormData({ pet_id: "", service_type: "", scheduled_date: "", notes: "" });
      fetchBookings();
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking(formData);
  };

  const handleEmergencyConsult = () => {
      if (pets.length === 0) {
          toast({ title: "Please add a pet in the 'My Pets' tab before requesting an emergency consult.", variant: "destructive" });
          return;
      }
      
      const notes = "URGENT: Requesting immediate video consultation for my pet.";

      createBooking({ pet_id: pets[0].id, service_type: "", scheduled_date: "", notes }, true);
  };

  const isEmergencyConsult = (booking: Booking) => booking.service_type === "Emergency Video Consult";


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <div className="flex gap-2">
          {/* New Emergency Button */}
          <Button variant="destructive" onClick={handleEmergencyConsult}>
            <PhoneCall className="mr-2 h-4 w-4" /> Emergency Consult
          </Button>
          
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
          <Card key={booking.id} className={isEmergencyConsult(booking) ? 'border-destructive/50 border-2 bg-red-50 dark:bg-destructive/10' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                    {isEmergencyConsult(booking) ? <PhoneCall className="h-5 w-5 text-destructive" /> : <Calendar className="h-5 w-5" />}
                    {booking.service_type}
                </span>
                {/* Join Call button visible when confirmed and URL exists */}
                {isEmergencyConsult(booking) && booking.status === 'confirmed' && booking.video_call_url && (
                    <Button variant="hero" size="sm" asChild>
                        <a href={booking.video_call_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" /> Join Call
                        </a>
                    </Button>
                )}
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