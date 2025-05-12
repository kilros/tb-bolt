'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, MessageSquare, FileText, ArrowLeft, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContractNotification {
  id: number;
  title: string;
  document: string;
  timestamp: string;
  status: 'pending' | 'completed';
  read: boolean;
}

interface MessageNotification {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockContractNotifications: ContractNotification[] = [
  {
    id: 1,
    title: "Contract Review Required",
    document: "Sales Agreement - ABC Corp",
    timestamp: "2024-03-20 14:30",
    status: "pending",
    read: false,
  },
  {
    id: 2,
    title: "Contract Approved",
    document: "NDA - XYZ Inc",
    timestamp: "2024-03-20 11:15",
    status: "completed",
    read: true,
  },
  {
    id: 3,
    title: "Contract Changes Requested",
    document: "Service Agreement - DEF Ltd",
    timestamp: "2024-03-19 16:45",
    status: "pending",
    read: false,
  },
];

const mockMessageNotifications: MessageNotification[] = [
  {
    id: 1,
    sender: "Alice Johnson",
    message: "Added comments to Sales Agreement draft",
    timestamp: "2024-03-20 15:20",
    read: false,
  },
  {
    id: 2,
    sender: "Bob Smith",
    message: "Requested review of updated terms",
    timestamp: "2024-03-20 13:10",
    read: true,
  },
  {
    id: 3,
    sender: "Carol Williams",
    message: "Shared new contract template",
    timestamp: "2024-03-19 09:30",
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <nav className="border-b border-gray-800 bg-[#1a1d21]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="https://imgur.com/pJvuGQK.png"
                alt="Tome Block Logo"
                width={160}
                height={40}
                className="object-contain cursor-pointer"
                onClick={() => router.push('/dashboard')}
                priority
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold text-gray-200">Notifications</h1>
        </div>

        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="bg-[#2a2d35] border-gray-700">
            <TabsTrigger value="contracts" className="data-[state=active]:bg-[#1a1d21]">
              <FileText className="h-4 w-4 mr-2" />
              Contract Updates
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#1a1d21]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="mt-6">
            <div className="space-y-4">
              {mockContractNotifications.map((notification) => (
                <Card key={notification.id} className={`p-4 bg-[#2a2d35] border-gray-700 ${!notification.read ? 'border-l-4 border-l-[#FFB800]' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-200 font-medium">{notification.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{notification.document}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">{notification.timestamp}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      notification.status === 'pending' 
                        ? 'bg-yellow-500/10 text-yellow-500' 
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="space-y-4">
              {mockMessageNotifications.map((notification) => (
                <Card key={notification.id} className={`p-4 bg-[#2a2d35] border-gray-700 ${!notification.read ? 'border-l-4 border-l-[#FFB800]' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-200 font-medium">{notification.sender}</h3>
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">{notification.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}