import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { getUserAddr } from "@/utils/interact";
import { useConfig } from "wagmi";
import { positions } from "@/utils/constants";
import { zeroAddress } from "viem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function AddCollabsModal({
    confirm = () => { },
    openModal = false,
    changeModalOpen = () => { }
}) {
    const config = useConfig();

    const [newCollab, setNewCollab] = useState({
        name: '',
        role: ''
    });

    const addCollabs = async () => {
        let collabs = [];
        const addr = await getUserAddr(config, newCollab.name.toLowerCase());

        if (addr != zeroAddress) {
            collabs = [{ collab: addr, role: newCollab.role }];
        } else {
            toast.error(`${newCollab.name} is not a registered user!`);
            return;
        }
        confirm(collabs);
        changeModalOpen(false);
    }

    return (
        <Dialog open={openModal} onOpenChange={changeModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Collaborator</DialogTitle>
                    <DialogDescription>
                        Add a new collaborator to the document
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">UserName</Label>
                        <Input
                            type="text"
                            placeholder="john"
                            value={newCollab.name}
                            onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                            className="bg-[#2a2d35] border-gray-700 text-gray-200"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={newCollab.role}
                            onValueChange={(value) => setNewCollab({ ...newCollab, role: value })}
                        >
                            <SelectTrigger className="bg-[#2a2d35] border-gray-700 text-gray-200">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2d35] border-gray-700 max-h-[300px]">
                                {positions.map((position) => (
                                    <SelectItem key={position} value={position.toLowerCase()}>
                                        {position}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                        onClick={addCollabs}
                        className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                    >
                        Add Collaborator
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}