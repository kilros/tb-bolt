import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const sampleMessages: Message[] = [
  {
    id: 1,
    sender: "John Doe",
    content: "Hey team, I've reviewed the latest changes to the contract.",
    timestamp: "10:30 AM",
    isCurrentUser: true
  },
  {
    id: 2,
    sender: "Sarah Smith",
    content: "Thanks John! What do you think about section 3.2?",
    timestamp: "10:32 AM",
    isCurrentUser: false
  },
  {
    id: 3,
    sender: "Michael Chen",
    content: "I noticed some inconsistencies in the payment terms. We should address those.",
    timestamp: "10:33 AM",
    isCurrentUser: false
  },
  {
    id: 4,
    sender: "John Doe",
    content: "Good catch Michael. I think we should revise the terms. The current language is a bit ambiguous.",
    timestamp: "10:35 AM",
    isCurrentUser: true
  },
  {
    id: 5,
    sender: "Emily Johnson",
    content: "I can help with the payment terms revision. I have some templates we can use.",
    timestamp: "10:35 AM",
    isCurrentUser: false
  },
  {
    id: 6,
    sender: "Sarah Smith",
    content: "That would be great Emily! Can you share those templates?",
    timestamp: "10:36 AM",
    isCurrentUser: false
  },
  {
    id: 7,
    sender: "John Doe",
    content: "Perfect! Let's review Emily's templates and incorporate the changes.",
    timestamp: "10:37 AM",
    isCurrentUser: true
  },
  {
    id: 8,
    sender: "Alex Rodriguez",
    content: "I'll need to review the changes once they're made. Please tag me when ready.",
    timestamp: "10:38 AM",
    isCurrentUser: false
  },
  {
    id: 9,
    sender: "Michael Chen",
    content: "Should we schedule a quick call to discuss these changes?",
    timestamp: "10:39 AM",
    isCurrentUser: false
  },
  {
    id: 10,
    sender: "Emily Johnson",
    content: "Just shared the templates in the documents folder. Let me know if you need any clarification.",
    timestamp: "10:40 AM",
    isCurrentUser: false
  },
  {
    id: 11,
    sender: "John Doe",
    content: "Thanks everyone! Yes Michael, let's have a call at 2 PM to finalize everything.",
    timestamp: "10:41 AM",
    isCurrentUser: true
  },
  {
    id: 12,
    sender: "Sarah Smith",
    content: "2 PM works for me. I'll send a calendar invite.",
    timestamp: "10:42 AM",
    isCurrentUser: false
  }
];

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const [messages] = React.useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (open) {
      // Use a small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setNewMessage("");
    scrollToBottom();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Group Chat</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#2a2d35] text-gray-200">
                    {message.sender.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div className="rounded-lg p-3 bg-[#2a2d35] text-gray-200">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSendMessage}
          className="border-t p-4 flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}