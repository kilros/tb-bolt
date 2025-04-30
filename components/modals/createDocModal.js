"use client"
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAccount, useConfig } from "wagmi";
import { getUserAddr } from "../../utils/interact";
import { zeroAddress } from "viem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserPlus } from 'lucide-react';
import { docTypes, permissions, permissionVal, roles } from "@/utils/constants";

export default function CreateDocModal({
    confirm = () => { },
    openModal = false,
    changeModalOpen = () => { },
}) {
    const config = useConfig();
    const { address } = useAccount();
    const [title, setTitle] = useState("");
    const [myRole, setMyRole] = useState("");
    const [docType, setDocType] = useState("");
    const [collaborators, setCollaborators] = useState([]);
    const [newCollaborator, setNewCollaborator] = useState({ username: '', role: '', permission: '' });

    const handleAddCollaborator = () => {
        if (!newCollaborator.username.trim() || !newCollaborator.role || !newCollaborator.permission) {
            toast.error('Please enter both username and role');
            return;
        }

        setCollaborators([...collaborators, newCollaborator]);
        setNewCollaborator({ username: '', role: '', permission: '' });
        toast.success('Collaborator added');
    };

    const handleRemoveCollaborator = (index) => {
        const newCollaborators = collaborators.filter((_, i) => i !== index);
        setCollaborators(newCollaborators);
        toast.success('Collaborator removed');
    };

    const handleSaveDocument = async () => {
        if (!title.trim()) {
            toast.error('Please enter the document name');
            return;
        }

        if (!docType) {
            toast.error('Please select the document type');
            return;
        }

        if (!myRole) {
            toast.error('Please select your role');
            return;
        }

        if (collaborators.length === 0) {
            toast.error('Please add at least one collaborator');
            return;
        }

        let collabList = collaborators.map((item) => item.username);
        let rolesList = collaborators.map((item) => item.role);
        let permissionsList = collaborators.map((item) => item.permission);


        let collabs = [];
        for (let i = 0; i < collabList.length; i++) {
            const userAddr = await getUserAddr(config, collabList[i].toLowerCase());
            if (userAddr == zeroAddress) {
                toast.error(`${collabList[i]} is not registered user!`);
                return;
            }
            collabs.push({
                collab: userAddr,
                role: rolesList[i],
                permission: permissionVal[permissionsList[i]]
            })
        }
        collabs.push({ collab: address, role: myRole.trim(), permission: permissionVal["ESign"]});

        confirm(title, docType, collabs);

        changeModalOpen(false);
    };

    return (
        <Dialog open={openModal} onOpenChange={changeModalOpen}>
            <DialogContent className="sm:max-w-lg bg-[#2a2d35] text-gray-200 border-gray-700">
                <DialogHeader>
                    <DialogTitle>Save Document</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter document details and add collaborators
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="documentName">Document Name *</Label>
                        <Input
                            id="documentName"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document name"
                            className="bg-[#1a1d21] border-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div className="flex flex-row gap-2">
                        <div className="grid gap-2 w-1/2">
                            <Label htmlFor="doctype">Document Type *</Label>
                            <Select
                                value={docType}
                                onValueChange={setDocType}
                                required
                            >
                                <SelectTrigger className="bg-[#1a1d21] border-gray-700 text-gray-200">
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#2a2d35] border-gray-700 max-h-[250px]">
                                    {docTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 w-1/2">
                            <Label htmlFor="creatorrole">Your Role *</Label>
                            <Select
                                value={myRole}
                                onValueChange={setMyRole}
                                required
                            >
                                <SelectTrigger className="bg-[#1a1d21] border-gray-700 text-gray-200">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#2a2d35] border-gray-700 max-h-[250px]">
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role.toLowerCase()}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Collaborators *</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Username"
                                value={newCollaborator.username}
                                onChange={(e) => setNewCollaborator({ ...newCollaborator, username: e.target.value })}
                                className="bg-[#1a1d21] border-gray-700 text-gray-200"
                            />
                            <Select
                                value={newCollaborator.role}
                                onValueChange={(value) => setNewCollaborator({ ...newCollaborator, role: value })}
                            >
                                <SelectTrigger className="w-[180px] bg-[#1a1d21] border-gray-700 text-gray-200">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#2a2d35] border-gray-700">
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role.toLowerCase()}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={newCollaborator.permission}
                                onValueChange={(value) => setNewCollaborator({ ...newCollaborator, permission: value })}
                            >
                                <SelectTrigger className="w-[180px] bg-[#1a1d21] border-gray-700 text-gray-200">
                                    <SelectValue placeholder="Select permission" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#2a2d35] border-gray-700">
                                    {permissions.map((permission) => (
                                        <SelectItem key={permission} value={permission}>
                                            {permission}
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
                                        <span className="text-gray-400 capitalize">{collaborator.role}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-400 capitalize">{collaborator.permission}</span>
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
                        onClick={() => changeModalOpen(false)}
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
    );
}
