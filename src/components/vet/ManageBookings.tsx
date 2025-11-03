import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react"; // Removed Video, PhoneCall

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes: string;
  user_id: string;
  profiles: { email: string };
  // Removed: video_call_url field
}

// Removed: generateRoomId utility

export const ManageBookings = ({ vetId }: { vetId: string }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase
      .channel('bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vet_bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("vet_bookings")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (error) {
      toast({ title: "Error fetching bookings", variant: "destructive" });
      return;
    }

    // Fetch user emails separately
    const bookingsWithEmails = await Promise.all(
      (data || []).map(async (booking) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", booking.user_id)
          .single();
        
        return {
          ...booking,
          profiles: profileData || { email: "Unknown" }
        };
      })
    );

    setBookings(bookingsWithEmails);
  };

  // Removed: isEmergencyConsult utility

  const updateBookingStatus = async (bookingId: string, status: string) => { // Removed isEmergency parameter
    let updateData: any = { status, vet_id: vetId };
    
    // Removed conditional logic to set video_call_url

    const { error } = await supabase
      .from("vet_bookings")
      .update(updateData)
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error updating booking", variant: "destructive" });
    } else {
      toast({ title: "Booking updated successfully!" });
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Patient Bookings</h2>
      
      <div className="grid gap-4">
        {bookings.map((booking) => {
          // const emergency = isEmergencyConsult(booking); // Removed
          // const cardClass = emergency ? '...' : ''; // Removed

          return (
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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Patient: {booking.profiles?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(booking.scheduled_date).toLocaleString()}
                  </p>
                  {/* Removed: video call url display logic for the vet */}
                  {booking.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Notes:</span> {booking.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm font-semibold">Status:</span>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateBookingStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};