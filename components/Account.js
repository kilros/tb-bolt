'use client'
import { useEffect, useState } from "react";
import { adrEllipsis } from "@/utils/utility";
import axios from "axios";
import { SiweMessage } from "siwe";
import { useAccount, useChainId, useConnect, useDisconnect, useSignMessage } from "wagmi";
import WalletModal from "./modals/walletModal";
import { URLs } from "@/utils/constants";
import { useTBContext } from "@/context/Context";

const Account = ({ main = false }) => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId()

  const { signMessageAsync } = useSignMessage();

  const { isAuth, setIsAuth } = useTBContext();

  const [isOpen, setIsOpen] = useState(false);

  const signIn = async () => {
    const nonce = (await axios.get(`${URLs.TBBackendAuth}/getNonce`, { withCredentials: true })).data;

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to Tome Block.',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });

    const messageToSign = message.prepareMessage();

    try {
      const signature = await signMessageAsync({ message: messageToSign });

      // Send the signature + message to the backend for verification
      const response = await axios.post(`${URLs.TBBackendAuth}/verify`, ({ message: message, signature: signature }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const authStatus = Boolean(response.data.ok);

      if (authStatus) {
        setIsAuth(true);
        console.log("✅ Authentication successful!");
      } else {
        console.error("❌ Authentication failed!");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  }

  const signOut = async () => {
    setIsAuth(false);
    await axios.get(`${URLs.TBBackendAuth}/logOut`, { withCredentials: true });
  }

  useEffect(() => {
    if (connector && connector.id != "web3auth")
      disconnect()
  }, [connector]);

  return (
    <div>
      {(() => {
        if (!isConnected) {
          return (
            <div className="hidden sm:block">
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className={`${main
                  ? ""
                  : "w-[242px] h-[52px] bg-[url('/images/ButtonBack1.png')] bg-no-repeat bg-top bg-contain hover:drop-shadow-[0px_0px_12px_#FFD130]"
                  } py-2 text-white font-desc2`}
              >
                <div className="flex flex-row justify-center items-center space-x-4">
                  <img src="/images/wallet.png" />
                  <div>Connect Wallet</div>
                </div>
              </button>
            </div>
          );
        }
        if (isConnected && !isAuth) {
          return (
            <div className="hidden sm:block">
              <button
                onClick={signIn}
                className={`${main
                  ? ""
                  : "w-[242px] h-[52px] bg-[url('/images/ButtonBack1.png')] bg-no-repeat bg-top bg-contain hover:drop-shadow-[0px_0px_12px_#FFD130]"
                  } py-2 text-white font-desc2`}
              >
                <div className="flex flex-row justify-center items-center space-x-4">
                  <img src="/images/wallet.png" />
                  <div>Sign In</div>
                </div>
              </button>
            </div>
          )
        }
        if (isConnected && isAuth) {
          return (
            <div>
              <div className="hidden sm:block">
                <button
                  onClick={() => setIsOpen(true)}
                  className={`${main
                    ? ""
                    : "w-[242px] h-[52px] bg-[url('/images/ButtonBack1.png')] bg-no-repeat bg-top bg-contain hover:drop-shadow-[0px_0px_12px_#FFD130]"
                    } py-2 text-white font-desc2`}
                >
                  <div className="flex flex-row justify-center items-center space-x-4">
                    <img src="/images/wallet.png" />
                    <div>{adrEllipsis(address, 4)}</div>
                  </div>
                </button>
              </div>
            </div>
          );
        }
      })()}
      <WalletModal
        confirm={() => { disconnect(); signOut() }}
        openModal={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default Account;