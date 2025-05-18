import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ReactLoading from "react-loading";

import { useAccount, useBalance, useConfig } from "wagmi";
import { adrEllipsis } from "@/utils/utility";
import { URLs } from "@/utils/constants";
import axios from "axios";
import { getSubscribe } from "@/utils/interact";
import { useTBContext } from "@/context/Context";
import { getPublicCompressed } from "@toruslabs/eccrypto";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    p: 2,
};

export default function WalletModal({
    confirm = () => { },
    openModal = false,
    onClose = () => { },
}) {
    const config = useConfig();
    const { address } = useAccount();
    const { data } = useBalance({ address });

    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const [isCopied, setIsCopied] = useState(false);

    const { web3Auth } = useTBContext();

    const copyAddr = () => {
        navigator.clipboard.writeText(address);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 1500)
    }

    const subscribe = async () => {
        setIsSubscribing(true);
        const userInfo = await web3Auth.getUserInfo();
        const provider = web3Auth.provider;

        const idToken = userInfo.idToken;
        const privKey = await provider.request({
            method: "eth_private_key",
        });

        try {
            const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString("hex");

            const res = await axios.post(`${URLs.TBBackendAPI}/subscribe`, ({ appPubKey: pubkey, idToken: idToken }), { withCredentials: true }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.data.isSuccess) {
                setTimeout(() => {
                    (async () => {
                        await getSubStatus();
                        setIsSubscribing(false);
                        toast.success("Successfully subscribed!");
                    })();
                }, 3000);
            } else {
                toast.success("Error in subscribe!");

            };
        } catch (e) {
            toast.success("Error in subscribe!");
            setIsSubscribing(false);
        }
    }

    const getSubStatus = async () => {
        const res = await getSubscribe(config, address);
        setIsSubscribed(res);
    }

    useEffect(() => {
        if (openModal) {
            getSubStatus();
        }
    }, [openModal])

    return (
        <Modal
            open={openModal}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-descript ion"
        >
            <Box sx={style} className="bg-black bg-opacity-40 rounded-md w-[360px] h-fit">
                <div className=" w-full h-full relative px-4 py-2">
                    <div
                        className="absolute top-1 right-2 cursor-pointer"
                        onClick={onClose}
                    >
                        <img
                            src="/images/closeIcon.svg"
                            className="hover:brightness-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 items-center">
                        <img
                            src="/images/logo.svg"
                            className="w-[80px]"
                        />
                        <div className="text-white font-black">{adrEllipsis(address, 6)}</div>
                        <div className="text-gray-400 text-sm">{(+data?.formatted).toFixed(4)} {data?.symbol}</div>
                    </div>
                    {!isSubscribed && (
                        <div className="text-black text-base pt-4">
                            <div className="cursor-pointer border-4 border-red-800 hover:border-red-600 bg-yellow-600 w-[100px] py-2 mx-auto text-center rounded"
                                onClick={() => { }}
                            >
                                {isSubscribing ? (
                                    <ReactLoading type="spinningBubbles" color="#000" width={20} height={20} className="mx-auto" />
                                ) : (
                                    <div onClick={subscribe}>Subscribe</div>
                                )}

                            </div>
                        </div>
                    )}
                    <div className="flex justify-between gap-4">
                        <div
                            className="w-1/2 bg-white cursor-pointer rounded border-2 border-white text-xs text-black font-bold py-2 px-4 mt-4 hover:scale-105"
                            onClick={copyAddr}
                        >
                            {!isCopied && (
                                <div className="flex flex-col gap-2 items-center">
                                    <img
                                        src="/images/copy.svg"
                                        className="w-[16px]"
                                    />
                                    Copy Address
                                </div>
                            )}
                            {isCopied && (
                                <div className="flex flex-col gap-2 items-center">
                                    <img
                                        src="/images/check.svg"
                                        className="w-[16px]"
                                    />
                                    Copied!
                                </div>
                            )}

                        </div>
                        <div
                            className="w-1/2 flex flex-col gap-2 items-center bg-white cursor-pointer rounded border-2 border-white text-xs text-black font-bold py-2 px-4 mt-4 hover:scale-105"
                            onClick={() => { confirm(); onClose(); }}
                        >
                            <img
                                src="/images/disconnect.svg"
                                className="w-[16px]"
                            />
                            Disconnect
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    );
}
