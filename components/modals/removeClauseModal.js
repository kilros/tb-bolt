"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RemoveClauseModal({
    confirm = () => { },
    openModal = false,
    changeModalOpen = () => { },
}) {

    return (
        <Dialog open={openModal} onOpenChange={changeModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove Clause</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this clause? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            changeModalOpen(false);
                        }}
                        className="border-gray-700 text-gray-200 hover:bg-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            confirm();
                            changeModalOpen(false);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
