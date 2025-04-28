'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Plus, FileText, Puzzle, X, Library, FolderOpen, Building, Briefcase, Mail, User, FileEdit, MessageSquare, FilePlus, Calendar, UserPlus, ArrowLeft, History, Clock, Menu, FileCheck, Sparkles as FileSparkles, FileCode, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentEditor } from '@/components/document-editor';
import { ChatModal } from '@/components/chat-modal';
import { toast } from "sonner";

interface DocumentHistory {
  timestamp: string;
  user: string;
  action: 'updated' | 'approved' | 'revoked';
  details?: string;
}

interface Collaborator {
  email: string;
  role: string;
  approved?: boolean;
}

interface Document {
  docId: string;
  title: string;
  description: string;
  category: string;
  dueDate?: string;
  collaborators: Collaborator[];
  createdDate: string;
  status: string;
  content?: string;
  history: DocumentHistory[];
}

const sampleDocuments: Document[] = [
  {
    docId: "DOC-2024-001",
    title: "Sales Agreement - ABC Corp",
    description: "Annual sales agreement with ABC Corporation for software licensing",
    category: "Contract",
    dueDate: "2024-04-15",
    collaborators: [
      { email: "john@example.com", role: "owner" },
      { email: "sarah@example.com", role: "editor" },
      { email: "legal@example.com", role: "approver" },
      { email: "finance@example.com", role: "reviewer" },
      { email: "sales@example.com", role: "viewer" }
    ],
    createdDate: "2024-03-01",
    status: "In Review",
    content: "Sample contract content...",
    history: [
      {
        timestamp: "2024-03-20 15:30:00",
        user: "sarah@example.com",
        action: "updated",
        details: "Updated payment terms section"
      },
      {
        timestamp: "2024-03-19 14:20:00",
        user: "legal@example.com",
        action: "approved",
        details: "Approved initial draft"
      }
    ]
  },
  {
    docId: "DOC-2024-002",
    title: "Employee Handbook 2024",
    description: "Updated company policies and procedures",
    category: "Policy",
    collaborators: [
      { email: "hr@example.com", role: "owner" },
      { email: "legal@example.com", role: "approver" },
      { email: "ceo@example.com", role: "approver" },
      { email: "manager@example.com", role: "editor" },
      { email: "compliance@example.com", role: "reviewer" },
      { email: "employee.rep@example.com", role: "viewer" }
    ],
    createdDate: "2024-03-10",
    status: "Draft",
    content: "Employee handbook content...",
    history: []
  },
  {
    docId: "DOC-2024-003",
    title: "Project Proposal - XYZ Project",
    description: "Technical proposal for XYZ client project",
    category: "Proposal",
    dueDate: "2024-03-30",
    collaborators: [
      { email: "pm@example.com", role: "owner" },
      { email: "tech@example.com", role: "editor" },
      { email: "architect@example.com", role: "editor" },
      { email: "sales@example.com", role: "reviewer" },
      { email: "finance@example.com", role: "approver" },
      { email: "legal@example.com", role: "approver" },
      { email: "client.rep@example.com", role: "viewer" }
    ],
    createdDate: "2024-03-15",
    status: "Pending Approval",
    content: "Project proposal content...",
    history: []
  },
  {
    docId: "DOC-2024-004",
    title: "NDA - DEF Industries",
    description: "Non-disclosure agreement for partnership with DEF Industries",
    category: "Agreement",
    dueDate: "2024-04-01",
    collaborators: [
      { email: "legal@example.com", role: "owner" },
      { email: "business@example.com", role: "viewer" },
      { email: "ceo@example.com", role: "approver" },
      { email: "partner.legal@def.com", role: "editor" },
      { email: "compliance@example.com", role: "reviewer" }
    ],
    createdDate: "2024-03-18",
    status: "Signed",
    content: "NDA content...",
    history: []
  },
  {
    docId: "DOC-2024-005",
    title: "Q1 2024 Financial Report",
    description: "Quarterly financial analysis and projections",
    category: "Report",
    collaborators: [
      { email: "finance@example.com", role: "owner" },
      { email: "cfo@example.com", role: "editor" },
      { email: "accountant@example.com", role: "editor" },
      { email: "auditor@example.com", role: "reviewer" },
      { email: "board@example.com", role: "approver" },
      { email: "ceo@example.com", role: "approver" },
      { email: "investor.relations@example.com", role: "viewer" },
      { email: "compliance@example.com", role: "viewer" }
    ],
    createdDate: "2024-03-20",
    status: "Final",
    content: "Financial report content...",
    history: []
  }
];

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
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [activeTab, setActiveTab] = useState('my-documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Corp",
    position: "Legal Counsel",
  });

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

  const handleApproveDocument = (collaborator: Collaborator) => {
    if (!editingDocument) return;

    const updatedCollaborators = editingDocument.collaborators.map(c =>
      c.email === collaborator.email
        ? { ...c, approved: true }
        : c
    );

    const newHistory: DocumentHistory = {
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      user: collaborator.email,
      action: 'approved',
      details: 'Approved document changes'
    };

    const updatedDocument = {
      ...editingDocument,
      collaborators: updatedCollaborators,
      history: [newHistory, ...(editingDocument.history || [])]
    };

    setDocuments(documents.map(doc =>
      doc.docId === editingDocument.docId
        ? updatedDocument
        : doc
    ));

    setEditingDocument(updatedDocument);
    toast.success('Document changes approved');
  };

  const handleRevokeApproval = (collaborator: Collaborator) => {
    if (!editingDocument) return;

    const updatedCollaborators = editingDocument.collaborators.map(c =>
      c.email === collaborator.email
        ? { ...c, approved: false }
        : c
    );

    const newHistory: DocumentHistory = {
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      user: collaborator.email,
      action: 'revoked',
      details: 'Revoked document approval'
    };

    const updatedDocument = {
      ...editingDocument,
      collaborators: updatedCollaborators,
      history: [newHistory, ...(editingDocument.history || [])]
    };

    setDocuments(documents.map(doc =>
      doc.docId === editingDocument.docId
        ? updatedDocument
        : doc
    ));

    setEditingDocument(updatedDocument);
    toast.success('Approval revoked');
  };

  const handleRemoveCollaborator = (collaboratorEmail: string) => {
    if (!editingDocument) return;

    const updatedCollaborators = editingDocument.collaborators.filter(
      c => c.email !== collaboratorEmail
    );

    const updatedDocument = {
      ...editingDocument,
      collaborators: updatedCollaborators
    };

    setDocuments(documents.map(doc =>
      doc.docId === editingDocument.docId
        ? updatedDocument
        : doc
    ));

    setEditingDocument(updatedDocument);
    toast.success('Collaborator removed');
  };

  const getApprovalStatus = (collaborator: Collaborator) => {
    if (collaborator.role.toLowerCase() === 'viewer') {
      return {
        label: 'Not Required',
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        showActions: false
      };
    }

    if (collaborator.approved) {
      return {
        label: 'Approved',
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
        showActions: true
      };
    }

    return {
      label: 'Pending',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      showActions: true
    };
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    return parts.map(part => part[0]?.toUpperCase() || '').join('');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Profile updated:', profile);
      setProfileDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'notifications') {
      router.push('/notifications');
    } else {
      setActiveTab(tabId);
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setDocumentContent(doc.content || '');
  };

  const handleUpdateDocument = () => {
    if (!editingDocument) return;

    const newHistory: DocumentHistory = {
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      user: profile.email,
      action: 'updated',
      details: 'Updated document content'
    };

    const updatedDocument = {
      ...editingDocument,
      content: documentContent,
      history: [newHistory, ...(editingDocument.history || [])]
    };

    setDocuments(documents.map(doc =>
      doc.docId === editingDocument.docId
        ? updatedDocument
        : doc
    ));

    setEditingDocument(updatedDocument);
    toast.success('Document updated successfully');
  };

  const handleRevokeDocument = () => {
    if (!editingDocument) return;

    setDocumentContent(editingDocument.content || '');
    toast.success('Changes revoked');
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
                    className={`px-3 py-2 text-sm font-medium relative ${activeTab === tab.id
                      ? 'text-[#FFB800]'
                      : 'text-gray-300 hover:text-gray-100'
                      }`}
                    onClick={() => {
                      handleTabClick(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tab.label}</span>
                      {tab.count && tab.count > 0 && (
                        <span className="ml-2 w-5 h-5 bg-[#FFB800] text-black text-xs font-medium rounded-full flex items-center justify-center">
                          {tab.count}
                        </span>
                      )}
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

        <main className="flex-1 container mx-auto px-4 py-6">
          {editingDocument ? (
            <div className="bg-[#2a2d35] rounded-lg p-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setEditingDocument(null)}
                      className="text-gray-300 hover:text-gray-100"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-200">{editingDocument.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRevokeDocument}
                      className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      Revoke Changes
                    </Button>
                    <Button
                      onClick={handleUpdateDocument}
                      className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                    >
                      Update Document
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="border-gray-700 text-gray-200 hover:bg-gray-700"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? 'Hide History' : 'Show History'}
                  </Button>
                </div>

                {showHistory && (
                  <div className="p-4 bg-[#1a1d21] rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-200 mb-4">Document History</h3>
                    <div className="space-y-4">
                      {editingDocument.history?.map((event, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[#2a2d35] border border-gray-700"
                        >
                          <div className="mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-200">
                                {event.user}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {event.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">
                              <span className={`font-medium ${event.action === 'approved' ? 'text-green-500' :
                                event.action === 'revoked' ? 'text-red-500' :
                                  'text-blue-500'
                                }`}>
                                {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                              </span>
                              {event.details && ` - ${event.details}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-[#1a1d21] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-200">Collaborators</h3>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {editingDocument.collaborators.map((collaborator, index) => {
                      const status = getApprovalStatus(collaborator);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-[#2a2d35] border border-gray-700"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#FFB800]/10 text-[#FFB800] text-sm">
                              {getInitials(collaborator.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-200">{collaborator.email}</span>
                            <span className="text-xs text-gray-400 capitalize">{collaborator.role}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${status.color}`}
                          >
                            {status.label}
                          </Badge>
                          <div className="flex gap-2 ml-2">
                            {status.showActions && (
                              <>
                                {!collaborator.approved ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveDocument(collaborator)}
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500 h-7 px-2 text-xs"
                                  >
                                    Approve
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleRevokeApproval(collaborator)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 h-7 px-2 text-xs"
                                  >
                                    Revoke
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleRemoveCollaborator(collaborator.email)}
                                  className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-gray-200 h-7 w-7 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <DocumentEditor
                  content={documentContent}
                  onChange={setDocumentContent}
                />
              </div>
            </div>
          ) : (
            <>
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

              <div className="bg-[#2a2d35] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-300 font-medium">DocID</TableHead>
                      <TableHead className="text-gray-300 font-medium">Title</TableHead>
                      <TableHead className="text-gray-300 font-medium">Created Date</TableHead>
                      <TableHead className="text-gray-300 font-medium">Status</TableHead>
                      <TableHead className="text-gray-300 font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          No documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.docId} className="border-b border-gray-700">
                          <TableCell className="text-gray-300">{doc.docId}</TableCell>
                          <TableCell className="text-gray-300">{doc.title}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(doc.createdDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-300">{doc.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDocument(doc)}
                              className="text-[#FFB800] hover:text-[#FFB800]/90"
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </main>

        {editingDocument && (
          <div className="fixed bottom-6 right-6">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF8A00] hover:from-[#FFB800]/90 hover:to-[#FF8A00]/90 text-black shadow-lg"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>
        )}

        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProfileUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">
                    <Building className="h-4 w-4 inline mr-2" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                  />
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

        <ChatModal open={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </>
  );
}