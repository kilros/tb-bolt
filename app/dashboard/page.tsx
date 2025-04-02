"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Plus, FileText, Puzzle, Upload, X, Library, FolderOpen, Building, Briefcase, Mail, User, FileEdit, MessageSquare, FilePlus, Calendar, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentEditor } from '@/components/document-editor';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Collaborator {
  email: string;
  role: string;
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
}

interface Template {
  id: number;
  name: string;
  dateAdded: string;
  content: string;
}

interface Clause {
  id: number;
  name: string;
  dateAdded: string;
  content?: string;
}

const mockTemplates: Template[] = [
  { 
    id: 1, 
    name: "Sales Agreement Template", 
    dateAdded: "2024-03-20",
    content: `
      <h1>Sales Agreement</h1>
      <p>This Sales Agreement (the "Agreement") is entered into as of [DATE] by and between:</p>
      <p><strong>Seller:</strong> [SELLER NAME]<br>
      <strong>Buyer:</strong> [BUYER NAME]</p>
      <h2>1. Sale of Goods</h2>
      <p>The Seller agrees to sell and the Buyer agrees to purchase the following goods:</p>
      <p>[DESCRIPTION OF GOODS]</p>
      <h2>2. Purchase Price</h2>
      <p>The Buyer agrees to pay the total purchase price of [AMOUNT] for the goods.</p>
    `
  },
  { 
    id: 2, 
    name: "NDA Template", 
    dateAdded: "2024-03-19",
    content: `
      <h1>Non-Disclosure Agreement</h1>
      <p>This Non-Disclosure Agreement (the "Agreement") is entered into as of [DATE] between:</p>
      <p><strong>Party A:</strong> [PARTY A NAME]<br>
      <strong>Party B:</strong> [PARTY B NAME]</p>
      <h2>1. Confidential Information</h2>
      <p>For purposes of this Agreement, "Confidential Information" shall mean any and all non-public information...</p>
    `
  },
  { 
    id: 3, 
    name: "Service Contract Template", 
    dateAdded: "2024-03-18",
    content: `
      <h1>Service Contract</h1>
      <p>This Service Contract (the "Contract") is made between:</p>
      <p><strong>Service Provider:</strong> [PROVIDER NAME]<br>
      <strong>Client:</strong> [CLIENT NAME]</p>
      <h2>1. Services</h2>
      <p>The Service Provider agrees to provide the following services:</p>
      <p>[DESCRIPTION OF SERVICES]</p>
    `
  },
];

const mockClauses: Clause[] = [
  { id: 1, name: "Confidentiality Clause", dateAdded: "2024-03-20" },
  { id: 2, name: "Termination Clause", dateAdded: "2024-03-19" },
  { id: 3, name: "Liability Clause", dateAdded: "2024-03-18" },
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [clauses, setClauses] = useState<Clause[]>(mockClauses);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');
  const [documentDueDate, setDocumentDueDate] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [clauseDialogOpen, setClauseDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [clauseLibraryOpen, setClauseLibraryOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [isViewingTemplate, setIsViewingTemplate] = useState(false);
  const [isViewingClause, setIsViewingClause] = useState(false);
  
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

  const categories = [
    'Contract',
    'Agreement',
    'Proposal',
    'Invoice',
    'Report',
    'Other'
  ];

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf') {
      setUploadedFile(file);
      
      // Simulate reading the PDF content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = `
          <h1>${file.name}</h1>
          <p>This is the converted content of your PDF file.</p>
          <p>In a production environment, this would contain the actual converted content of your PDF.</p>
        `;
        
        if (templateDialogOpen) {
          const newTemplate: Template = {
            id: templates.length + 1,
            name: file.name.replace('.pdf', ''),
            dateAdded: new Date().toISOString().split('T')[0],
            content: content
          };
          setSelectedTemplate(newTemplate);
          setIsViewingTemplate(true);
        } else if (clauseDialogOpen) {
          const newClause: Clause = {
            id: clauses.length + 1,
            name: file.name.replace('.pdf', ''),
            dateAdded: new Date().toISOString().split('T')[0],
            content: content
          };
          setSelectedClause(newClause);
          setIsViewingClause(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleTemplateUpload = async () => {
    if (!uploadedFile || !selectedTemplate) return;
    
    try {
      setTemplates([selectedTemplate, ...templates]);
      setUploadedFile(null);
      setSelectedTemplate(null);
      setIsViewingTemplate(false);
      setTemplateDialogOpen(false);
      toast.success('Template uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload template');
    }
  };

  const handleClauseUpload = async () => {
    if (!uploadedFile || !selectedClause) return;
    
    try {
      setClauses([selectedClause, ...clauses]);
      setUploadedFile(null);
      setSelectedClause(null);
      setIsViewingClause(false);
      setClauseDialogOpen(false);
      toast.success('Clause uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload clause');
    }
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
      setNotificationsDialogOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setDocumentContent(template.content);
    setIsEditing(true);
    setTemplateLibraryOpen(false);
    toast.success('Template loaded successfully');
  };

  const handleAddCollaborator = (email: string, role: string) => {
    setCollaborators([...collaborators, { email, role }]);
    toast.success('Collaborator added successfully');
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
    toast.success('Collaborator removed');
  };

  const handleSaveDocument = () => {
    if (!documentTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    const newDocument: Document = {
      docId: `DOC-${Math.random().toString(36).substr(2, 9)}`,
      title: documentTitle,
      description: documentDescription,
      category: documentCategory,
      dueDate: documentDueDate || undefined,
      collaborators: collaborators,
      createdDate: new Date().toISOString(),
      status: 'Draft',
      content: documentContent,
    };

    setDocuments([newDocument, ...documents]);
    setDocumentTitle('');
    setDocumentDescription('');
    setDocumentCategory('');
    setDocumentDueDate('');
    setCollaborators([]);
    setDocumentContent('');
    setIsEditing(false);
    setSaveDialogOpen(false);
    toast.success('Document saved successfully');
  };

  return (
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

            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 py-2 text-sm font-medium relative ${
                    activeTab === tab.id
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

            <div className="flex items-center space-x-4">
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
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Blank Document
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <div className="p-2">
                  <div className="flex items-center mb-2 px-2 text-sm font-medium text-gray-400">
                    <Library className="h-4 w-4 mr-2" />
                    From Template
                  </div>
                  <div className="space-y-1">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700/50 flex items-center text-gray-200"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2 text-[#FFB800]" />
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={templateLibraryOpen} onOpenChange={setTemplateLibraryOpen}>
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
              <DropdownMenuContent className="w-72 bg-[#2a2d35] border-gray-700">
                <DropdownMenuItem 
                  onClick={() => {
                    setTemplateLibraryOpen(false);
                    setTemplateDialogOpen(true);
                  }}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Template
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <div className="p-2">
                  <div className="flex items-center mb-2 px-2 text-sm font-medium text-gray-400">
                    <Library className="h-4 w-4 mr-2" />
                    Template Library
                  </div>
                  <div className="space-y-1">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700/50 flex items-center text-gray-200"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsViewingTemplate(true);
                          setTemplateLibraryOpen(false);
                          setTemplateDialogOpen(true);
                        }}
                      >
                        <FolderOpen className="h-4 w-4 mr-2 text-[#FFB800]" />
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={clauseLibraryOpen} onOpenChange={setClauseLibraryOpen}>
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
              <DropdownMenuContent className="w-72 bg-[#2a2d35] border-gray-700">
                <DropdownMenuItem 
                  onClick={() => {
                    setClauseLibraryOpen(false);
                    setClauseDialogOpen(true);
                  }}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Clause
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <div className="p-2">
                  <div className="flex items-center mb-2 px-2 text-sm font-medium text-gray-400">
                    <Library className="h-4 w-4 mr-2" />
                    Clause Library
                  </div>
                  <div className="space-y-1">
                    {clauses.map((clause) => (
                      <button
                        key={clause.id}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700/50 flex items-center text-gray-200"
                        onClick={() => {
                          setSelectedClause(clause);
                          setIsViewingClause(true);
                          setClauseLibraryOpen(false);
                          setClauseDialogOpen(true);
                        }}
                      >
                        <FolderOpen className="h-4 w-4 mr-2 text-[#FFB800]" />
                        {clause.name}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-[#2a2d35] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-200">New Document</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setDocumentContent('');
                  }}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setSaveDialogOpen(true)}
                  className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                >
                  Save Document
                </Button>
              </div>
            </div>
            <DocumentEditor
              content={documentContent}
              onChange={setDocumentContent}
            />
          </div>
        ) : (
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
                          onClick={() => {
                            setDocumentContent(doc.content || '');
                            setIsEditing(true);
                          }}
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
        )}
      </main>

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
              <div className="grid gap-2">
                <Label htmlFor="position">
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  Position
                </Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="bg-[#2a2d35] border-gray-700 text-gray-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isViewingTemplate ? (selectedTemplate?.name || 'View Template') : 'Add Template'}
            </DialogTitle>
            <DialogDescription>
              {isViewingTemplate
                ? 'View and edit the template content'
                : 'Upload a PDF file to add it to your template library.'}
            </DialogDescription>
          </DialogHeader>
          {isViewingTemplate ? (
            <div className="grid gap-4 py-4">
              <DocumentEditor
                content={selectedTemplate?.content || ''}
                onChange={(content) => {
                  if (selectedTemplate) {
                    setSelectedTemplate({ ...selectedTemplate, content });
                  }
                }}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsViewingTemplate(false);
                    setTemplateDialogOpen(false);
                  }}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={handleTemplateUpload}
                  className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black " >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-[#FFB800] bg-[#FFB800]/10' : 'border-gray-600 hover:border-gray-500'}
                  ${uploadedFile ? 'bg-green-500/10 border-green-500' : ''}`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className="text-green-500">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : isDragActive ? (
                  <div className="text-[#FFB800]">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p>Drop the PDF file here</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p>Drag & drop a PDF file here, or click to select</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleTemplateUpload}
                disabled={!uploadedFile}
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Upload Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={clauseDialogOpen} onOpenChange={setClauseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isViewingClause ? (selectedClause?.name || 'View Clause') : 'Add Clause'}
            </DialogTitle>
            <DialogDescription>
              {isViewingClause
                ? 'View and edit the clause content'
                : 'Upload a PDF file to add it to your clause library.'}
            </DialogDescription>
          </DialogHeader>
          {isViewingClause ? (
            <div className="grid gap-4 py-4">
              <DocumentEditor
                content={selectedClause?.content || ''}
                onChange={(content) => {
                  if (selectedClause) {
                    setSelectedClause({ ...selectedClause, content });
                  }
                }}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedClause(null);
                    setIsViewingClause(false);
                    setClauseDialogOpen(false);
                  }}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={handleClauseUpload}
                  className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-[#FFB800] bg-[#FFB800]/10' : 'border-gray-600 hover:border-gray-500'}
                  ${uploadedFile ? 'bg-green-500/10 border-green-500' : ''}`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className="text-green-500">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : isDragActive ? (
                  <div className="text-[#FFB800]">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p>Drop the PDF file here</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p>Drag & drop a PDF file here, or click to select</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleClauseUpload}
                disabled={!uploadedFile}
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Upload Clause
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Document</DialogTitle>
            <DialogDescription>
              Enter document details and metadata
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                className="bg-[#2a2d35] border-gray-700 text-gray-200"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Enter document description"
                className="bg-[#2a2d35] border-gray-700 text-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={documentCategory} onValueChange={setDocumentCategory}>
                <SelectTrigger className="bg-[#2a2d35] border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  id="dueDate"
                  type="date"
                  value={documentDueDate}
                  onChange={(e) => setDocumentDueDate(e.target.value)}
                  className="bg-[#2a2d35] border-gray-700 text-gray-200"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Collaborators</Label>
              <div className="space-y-2">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-700/30 p-2 rounded">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-200">{collaborator.email}</span>
                    <span className="text-gray-400">({collaborator.role})</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => handleRemoveCollaborator(collaborator.email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Email"
                    className="bg-[#2a2d35] border-gray-700 text-gray-200"
                    id="collaboratorEmail"
                  />
                  <Select defaultValue="viewer">
                    <SelectTrigger className="bg-[#2a2d35] border-gray-700 text-gray-200 w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-200 hover:bg-gray-700"
                    onClick={() => {
                      const emailInput = document.getElementById('collaboratorEmail') as HTMLInputElement;
                      const email = emailInput.value;
                      const roleSelect = document.querySelector('[data-value]') as HTMLElement;
                      const role = roleSelect?.getAttribute('data-value') || 'viewer';
                      if (email) {
                        handleAddCollaborator(email, role);
                        emailInput.value = '';
                      }
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              className="border-gray-700 text-gray-200 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDocument}
              disabled={!documentTitle.trim()}
              className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
            >
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="contracts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contracts" className="relative">
                <span className="pr-6">Contracts</span>
                {unreadContractNotifications > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 bg-[#FFB800] text-black text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadContractNotifications}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="messages" className="relative">
                <span className="pr-6">Messages</span>
                {unreadMessageNotifications > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 bg-[#FFB800] text-black text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadMessageNotifications}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="contracts" className="mt-4 space-y-4">
              {mockContractNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-gray-800/30 border-gray-700' : 'bg-[#FFB800]/5 border-[#FFB800]/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-[#FFB800]'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{notification.document}</p>
                    </div>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="messages" className="mt-4 space-y-4">
              {mockMessageNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-gray-800/30 border-gray-700' : 'bg-[#FFB800]/5 border-[#FFB800]/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-[#FFB800]'}`}>
                        {notification.sender}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}