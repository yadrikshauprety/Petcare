import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Video, PhoneCall } from "lucide-react";

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  notes: string;
  user_id: string;
  profiles: { email: string };
  video_call_url: string | null; // <-- ADDED
}

// Utility to generate a unique room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4, 9);


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

  const isEmergencyConsult = (booking: Booking) => booking.service_type === "Emergency Video Consult";


  const updateBookingStatus = async (bookingId: string, status: string, isEmergency: boolean) => {
    let updateData: any = { status, vet_id: vetId };
    
    const bookingToUpdate = bookings.find(b => b.id === bookingId);

    // If confirming an emergency consult, ensure a video URL is set/generated
    if (isEmergency && status === 'confirmed' && !bookingToUpdate?.video_call_url) {
        updateData.video_call_url = `https://petcare.pro/call/${generateRoomId()}`;
    }
    
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
          const emergency = isEmergencyConsult(booking);
          const cardClass = emergency ? 'border-destructive/50 border-2 bg-red-50 dark:bg-destructive/10' : '';

          return (
            <Card key={booking.id} className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {emergency ? <PhoneCall className="h-5 w-5 text-destructive" /> : <Calendar className="h-5 w-5" />}
                    {booking.service_type}
                  </span>
                  {/* Join Call button visible when confirmed and URL exists */}
                  {emergency && booking.status === 'confirmed' && booking.video_call_url && (
                    <Button variant="destructive" size="sm" asChild>
                        <a href={booking.video_call_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" /> Join Patient
                        </a>
                    </Button>
                  )}
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
                  {/* Display video link for the vet */}
                  {emergency && booking.video_call_url && (
                     <p className="text-xs text-destructive">
                       Call Link: <a href={booking.video_call_url} target="_blank" rel="noopener noreferrer" className="underline">{booking.video_call_url}</a>
                     </p>
                  )}
                  {booking.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Notes:</span> {booking.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm font-semibold">Status:</span>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateBookingStatus(booking.id, value, emergency)}
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