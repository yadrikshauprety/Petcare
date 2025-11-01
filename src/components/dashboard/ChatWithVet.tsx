import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export const ChatWithVet = ({ userId }: { userId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [vetId, setVetId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVet();
  }, []);

  useEffect(() => {
    if (vetId) {
      fetchMessages();
      const channel = supabase
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [vetId]);

  const fetchVet = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "vet")
      .limit(1)
      .single();

    if (!error && data) {
      setVetId(data.user_id);
    }
  };

  const fetchMessages = async () => {
    if (!vetId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${vetId}),and(sender_id.eq.${vetId},recipient_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error fetching messages", variant: "destructive" });
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !vetId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: vetId,
      content: newMessage
    });

    if (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    } else {
      setNewMessage("");
      fetchMessages();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chat with Veterinarian</h2>
      
      <Card className="h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender_id === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
