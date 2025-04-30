"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DocumentEditor } from '@/components/document-editor';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserPlus } from 'lucide-react';
import { toast } from "sonner";

interface Collaborator {
  username: string;
  position: string;
}

export default function NewDocPage() {
  const [documentContent, setDocumentContent] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaborator, setNewCollaborator] = useState<Collaborator>({ username: '', position: '' });
  const router = useRouter();

  const positions = [
    "Owner",
    "Editor",
    "Viewer",
    "Approver",
    "Reviewer"
  ];

  const handleAddCollaborator = () => {
    if (!newCollaborator.username.trim() || !newCollaborator.position) {
      toast.error('Please enter both username and position');
      return;
    }

    setCollaborators([...collaborators, newCollaborator]);
    setNewCollaborator({ username: '', position: '' });
    toast.success('Collaborator added');
  };

  const handleRemoveCollaborator = (index: number) => {
    const newCollaborators = collaborators.filter((_, i) => i !== index);
    setCollaborators(newCollaborators);
    toast.success('Collaborator removed');
  };

  const handleSaveDocument = () => {
    if (!documentName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    if (!documentContent.trim()) {
      toast.error('Document content cannot be empty');
      return;
    }

    // Here you would typically save the document with its collaborators
    console.log('Saving document:', {
      name: documentName,
      content: documentContent,
      collaborators
    });

    toast.success('Document saved successfully');
    setSaveDialogOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-[#2a2d35] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200">New Document</h2>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
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
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#2a2d35] text-gray-200 border-gray-700">
          <DialogHeader>
            <DialogTitle>Save Document</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter document details and add collaborators
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                className="bg-[#1a1d21] border-gray-700 text-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label>Collaborators</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Username"
                  value={newCollaborator.username}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, username: e.target.value })}
                  className="bg-[#1a1d21] border-gray-700 text-gray-200"
                />
                <Select
                  value={newCollaborator.position}
                  onValueChange={(value) => setNewCollaborator({ ...newCollaborator, position: value })}
                >
                  <SelectTrigger className="w-[180px] bg-[#1a1d21] border-gray-700 text-gray-200">
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
                <Button
                  type="button"
                  onClick={handleAddCollaborator}
                  className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((collaborator, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-[#1a1d21] border border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200">{collaborator.username}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400 capitalize">{collaborator.position}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(index)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
            >
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}