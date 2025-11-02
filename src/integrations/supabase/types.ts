export type Json =
// ... (omitted unchanged code)

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
// ... (omitted unchanged tables)
      vet_bookings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string | null
          scheduled_date: string
          service_type: string
          status: string
          updated_at: string
          user_id: string
          vet_id: string | null
          video_call_url: string | null // <-- ADDED
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          scheduled_date: string
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
          vet_id?: string | null
          video_call_url?: string | null // <-- ADDED
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          scheduled_date?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          vet_id?: string | null
          video_call_url?: string | null // <-- ADDED
        }
        Relationships: [
          {
// ... (omitted unchanged code)