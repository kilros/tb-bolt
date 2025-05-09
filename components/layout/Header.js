"use client"
import React, { useState } from "react";
import Image from 'next/image';
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X, User, Mail, Building, Briefcase, AtSign } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Logo } from "@/assets";
import { positions } from "@/utils/constants";
import { useTBContext } from "@/context/Context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Header() {

  const router = useRouter();
  const pathname = usePathname();

  const { isOnMyDoc, setIsOnMyDoc, isOnSharedDoc, setIsOnSharedDoc } = useTBContext();


  const [profileDialogOpen, setProfileDialogOpen] = useState(false);


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState({
    userName: "John",
    fullName: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Corp",
    position: "Legal Counsel",
  });

  const tabs = [
    { func: isOnMyDoc ? () => { setIsOnMyDoc(false) } : () => { router.push("/myDocs"); }, label: "My Documents", id: "myDocs" },
    { func: isOnSharedDoc ? () => { setIsOnSharedDoc(false) } : () => { router.push("/sharedDocs"); }, label: "Shared Documents", id: "sharedDocs" },
    {
      func: () => { router.push("/notifications") }, label: "Notifications", id: "notifications", count: 0
    }
  ];

  return (
    <>
      <nav className="border-b border-gray-800 bg-[#1a1d21]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/home")}>
              <Image
                src={Logo}
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
                    className={`px-3 py-2 text-sm font-medium relative ${pathname.includes(tab.id)
                      ? 'text-[#FFB800]'
                      : 'text-gray-300 hover:text-gray-100'
                      }`}
                    onClick={() => { tab.func() }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-gray-300 hover:text-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF8A00] flex items-center justify-center text-black font-medium">
                      {profile.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium">{profile.fullName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} py-4`}>
            <div className="flex flex-col space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 py-2 text-sm font-medium relative ${pathname.includes(tab.id)
                    ? 'text-[#FFB800]'
                    : 'text-gray-300 hover:text-gray-100'
                    }`}
                  onClick={() => {
                    tab.func();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-3 px-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF8A00] flex items-center justify-center text-black font-medium">
                    {profile.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{profile.fullName}</p>
                    <p className="text-xs text-gray-400">{profile.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-gray-100"
                    onClick={() => {
                      setProfileDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-gray-100"
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form >
            <div className="grid gap-4 py-4">
              <div className="flex flex-row gap-2">
                <div className="grid w-1/2 gap-1">
                  <Label>
                    <User className="h-4 w-4 inline mr-2 mb-1" />
                    Full Name
                  </Label>
                  <Input
                    value={profile.fullName}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                    disabled
                  />
                </div>
                <div className="grid w-1/2 gap-1">
                  <Label>
                    <AtSign className="h-4 w-4 inline mr-2 mb-1" />
                    UserName
                  </Label>
                  <Input
                    value={profile.userName}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                    disabled
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>
                  <Mail className="h-4 w-4 inline mr-2 mb-0.5" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={profile.email}
                  className="bg-[#2a2d35] border-gray-700 text-gray-200"
                  disabled
                />
              </div>
              <div className="flex flex-row gap-2">
                <div className="grid w-1/2 gap-1">
                  <Label>
                    <Building className="h-4 w-4 inline mr-2 mb-1" />
                    Company
                  </Label>
                  <Input
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                  />
                </div>
                <div className="grid w-1/2 gap-1">
                  <Label>
                    <Briefcase className="h-4 w-4 inline mr-2 mb-1" />
                    Position
                  </Label>
                  <Select
                    value={profile.position}
                    onValueChange={(value) => setProfile({ ...profile, position: value })}
                  >
                    <SelectTrigger className="w-[180px] bg-[#2a2d35] border-gray-700 text-gray-200">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2d35] border-gray-700">
                      {positions.map((position) => (
                        <SelectItem key={position} value={position.toLowerCase()}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
