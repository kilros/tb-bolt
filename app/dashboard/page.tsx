'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Plus, FileText, Puzzle, X, FilePlus, Menu, FileCheck, Sparkles as FileSparkles, FileCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockContractNotifications = [
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

const mockMessageNotifications = [
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

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadContractNotifications = mockContractNotifications.filter(n => !n.read).length;
  const unreadMessageNotifications = mockMessageNotifications.filter(n => !n.read).length;
  const unreadNotificationsCount = unreadContractNotifications + unreadMessageNotifications;

  const tabs = [
    { id: 'my-documents', label: 'My Documents' },
    { id: 'shared-documents', label: 'Shared Documents' },
    {
      id: 'notifications',
      label: 'Notifications',
      count: unreadNotificationsCount
    },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'notifications') {
      router.push('/notifications');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#1a1d21] flex flex-col">
        <nav className="border-b border-gray-800 bg-[#1a1d21]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Image
                  src="https://imgur.com/pJvuGQK.png"
                  alt="Tome Block Logo"
                  width={160}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>

              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300 hover:text-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
              <div className='hidden md:flex items-center'>
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-3 py-2 text-sm font-medium relative ${activeTab === tab.id
                        ? 'text-[#FFB800]'
                        : 'text-gray-300 hover:text-gray-100'
                        }`}
                      onClick={() => handleTabClick(tab.id)}
                    >
                      {tab.label}
                      {tab.count && tab.count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFB800] text-black text-xs font-medium rounded-full flex items-center justify-center">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2a2d35] border-gray-700 text-gray-200 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black">
                    <Plus className="h-5 w-5 mr-2" />
                    New Document
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                  <DropdownMenuItem
                    onClick={() => router.push('/newDoc')}
                    className="flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Blank Document
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="flex items-center">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Sales Agreement
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <FileSparkles className="h-4 w-4 mr-2" />
                    Service Contract
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <FileCode className="h-4 w-4 mr-2" />
                    NDA Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-200 hover:bg-gray-700"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Add Template
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                  <DropdownMenuItem
                    onClick={() => router.push('/newTemplate')}
                    className="flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Blank Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="flex items-center">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Import Template
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <FileSparkles className="h-4 w-4 mr-2" />
                    From Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-200 hover:bg-gray-700"
                  >
                    <Puzzle className="h-5 w-5 mr-2" />
                    Add Clause
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                  <DropdownMenuItem
                    onClick={() => router.push('/newClause')}
                    className="flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    New Clause
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="flex items-center">
                    <FileCheck className="h-4 w-4 mr-2" />
                    From Template
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <FileSparkles className="h-4 w-4 mr-2" />
                    From Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}