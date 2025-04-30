"use client"
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { useMediaQuery } from "@mui/material";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isNewName } from "@/utils/interact";
import { useConfig } from "wagmi";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    p: 4,
};

export default function RegisterModal({
    user = ["", "", "", "", ""],
    isRegistered = false,
    openModal = false,
    confirm = () => { },
    onClose = () => { },
}) {
    const isPhoneMode = useMediaQuery("(max-width:900px)");

    const config = useConfig();

    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");

    const confirmUser = async () => {

        if (userName.trim() == "" || company.trim() == "" || firstName.trim() == "" || lastName.trim() == "") {
            toast.error("Please fill mandatory fields.")
        } else {
            const res = await isNewName(config, userName.trim().toLowerCase());

            if (res) {
                if (isRegistered)
                    confirm(userName.toLowerCase(), company, position);
                else
                    confirm(userName.toLowerCase(), firstName, lastName, company, position);
                onClose();
            } else {
                toast.error("That user name already exists.")
            }
        }
    }

    useEffect(() => {
        setUserName(user[0]);
        setFirstName(user[1]);
        setLastName(user[2]);
        setCompany(user[3]);
        setPosition(user[4]);
    }, [user])

    return (
        <div>
            {isPhoneMode && openModal ? (
                <div className="min-h-screen ml-[2px] mt-[67px] bg-cover w-full z-20">
                </div>
            ) : (
                <Modal
                    open={openModal}
                    onClose={onClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-descript ion"
                >
                    <Box sx={style} className="bg-black bg-opacity-50 rounded-md">
                        <div className=" w-full h-full relative px-4 py-2">
                            <div
                                className="absolute top-2 right-4 cursor-pointer"
                                onClick={onClose}
                            >
                                <img
                                    src="/images/closeIcon.svg"
                                    className="hover:brightness-200"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-4 mt-4 items-center">
                                <div className="flex flex-col">
                                    <div className="text-base text-center text-white font-bold">
                                        User Name*
                                    </div>
                                    <div className="mt-2">
                                        <input className="px-2" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <div className="flex flex-col">
                                        <div className="text-base text-center text-white font-bold">
                                            First Name*
                                        </div>
                                        <div className="mt-2">
                                            <input className="px-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isRegistered} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-base text-center text-white font-bold">
                                            Last Name*
                                        </div>
                                        <div className="mt-2">
                                            <input className="px-2" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isRegistered} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <div className="flex flex-col">
                                        <div className="text-base text-center text-white font-bold">
                                            Company
                                        </div>
                                        <div className="mt-2">
                                            <input className="px-2" value={company} onChange={(e) => setCompany(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-base text-center text-white font-bold">
                                            Position
                                        </div>
                                        <div className="mt-2">
                                            <input className="px-2" value={position} onChange={(e) => setPosition(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center items-center">
                                <div
                                    className="cursor-pointer rounded-full border-2 border-white hover:shadow-[0_2px_16px_rgba(242,87,87,1)] text-xs text-white text-center font-bold py-2 mt-4  w-1/2"
                                    onClick={confirmUser}
                                >
                                    Confirm
                                </div>
                            </div>
                        </div>
                    </Box>
                </Modal>
            )}
        </div>
    );
}
