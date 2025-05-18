"use client"
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

import { URLs } from "../../utils/constants";
import axios from "axios";
import { useAccount, useConfig } from "wagmi";
import { getUserName } from "../../utils/interact";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    p: 4,
};

export default function ChatModal({
    openModal = false,
    roomId = null,
    resetUnreads = () => { },
    socket = null,
    setMessages = () => { },
    messages = [],
    changeModalOpen = () => { },
}) {

    const config = useConfig();
    const { address } = useAccount();

    const [currentMessage, setCurrentMessage] = useState({ message: "", time: new Date() });

    const [userName, setUserName] = useState(null);

    const chatsRef = useRef(null);

    const scrollDown = () => {
        chatsRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const sendMsg = async () => {
        if (socket && currentMessage.message.trim() != "" && userName) {
            await socket.emit("send_message", userName, address, roomId, currentMessage.message);
            setCurrentMessage({ message: "", time: currentMessage.time })
        }
    }

    const handleKeyPress = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await sendMsg();
            if (currentMessage.message.trim() == "") {
                setCurrentMessage({ message: "", time: currentMessage.time })
            }
        }
    }

    useEffect(() => {
        const openChat = async () => {
            await socket.emit("open_chat", address, roomId);
        }
        if (openModal) {
            resetUnreads();
            if (socket) {
                openChat();
                setCurrentMessage((current) => ({ message: current.message, time: new Date() }))
            }
        }
    }, [openModal])

    useEffect(() => {
        if (chatsRef.current) {
            scrollDown()
        }
    }, [messages, currentMessage])

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = (await axios.get(`${URLs.TBBackendChat}/readmsgs?groupId=${roomId}`, { withCredentials: true })).data;

                if (data.isSuccess) {
                    setMessages(data.messages);
                } else {
                    toast.error("Error in fetching messages!")
                }

            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }
        if (openModal) {
            fetchMessages();
        }

    }, [openModal])

    useEffect(() => {
        const initUserName = async () => {
            const res = await getUserName(config, address);
            setUserName(res);
        }

        if (address) initUserName();
    }, [address])

    return (
        <Dialog open={openModal} onOpenChange={changeModalOpen} >
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Group Chat</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-[#2a2d35] text-gray-200">
                                        {message.userName.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1 max-w-[80%]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">{message.userName}</span>
                                        <span className="text-xs text-gray-500">{(new Date(message.time)).toLocaleTimeString([], { timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="rounded-lg p-3 bg-[#2a2d35] text-gray-200">
                                        {message.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={chatsRef} />
                </ScrollArea>
                <div
                    className="border-t p-4 flex gap-2"
                >
                    <Input
                        placeholder="Type a message..."
                        value={currentMessage.message}
                        onChange={(e) => setCurrentMessage({ message: e.target.value, time: currentMessage.time })}
                        className="flex-1"
                        onKeyDown={handleKeyPress}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
                        onClick={sendMsg}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
