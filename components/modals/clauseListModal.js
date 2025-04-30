"use client"
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { useMediaQuery } from "@mui/material";
import axios from "axios";
import { URLs } from "@/utils/constants";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    p: 4,
    width: 500,
    height: 400
};

export default function ClauseListModal({
    openModal = false,
    confirm = () => {},
    onClose = () => { },
}) {
    const isPhoneMode = useMediaQuery("(max-width:900px)");

    const [clsList, setClsList] = useState([]);


    const initClsList = async () => {
        const data = (await axios.get(`${URLs.TBBackendClause}/allClauses`, { withCredentials: true })).data;
        if (data.isSuccess)
            setClsList(data.clauses);
    }

    useEffect(() => {
        if (openModal) {
            initClsList();
        }
    }, [openModal])

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
                    <Box sx={style} className="bg-[#1d2030] rounded-md">
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
                            {clsList.length > 0 ? (
                                <div className="my-12 flex flex-col gap-2 h-4/5 overflow-y-auto items-center  text-white">
                                    {clsList.map((cls, index) => (
                                        <div key={index} className="underline cursor-pointer hover:text-yellow-200 font-bold" onClick={() => { confirm(cls.url); onClose()}}>{cls.title}</div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-4/5 text-white">No available clauses.</div>
                            )}

                        </div>
                    </Box>
                </Modal>
            )}
        </div>
    );
}
