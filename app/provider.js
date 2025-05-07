"use client"
import "./globals.css";
import React, { useEffect, useState } from "react";

import { createConfig, WagmiProvider, fallback, http } from "wagmi";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Web3AuthConnectorInstance from "@/utils/Web3AuthConnectorInstance";

// import { sepolia } from "wagmi/chains";
import { ToastContainer } from "react-toastify";

import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS

import { usePathname } from "next/navigation";
import { TBContext } from "../context/Context";
import { baseSepolia } from "viem/chains";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/Header";

const queryClient = new QueryClient();

function TBProvider({ children }) {
  const [isOnMyDoc, setIsOnMyDoc] = useState(false);
  const [isOnSharedDoc, setIsOnSharedDoc] = useState(false);
  const [docData, setDocData] = useState(null);

  const [template, setTemplate] = useState(null);
  const [clause, setClause] = useState(null);

  const [config, setConfig] = useState(null);

  const [web3Auth, setWeb3Auth] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const pathName = usePathname();

  useEffect(() => {
    const init = async () => {
      const { connector, web3AuthInstance } = Web3AuthConnectorInstance([baseSepolia]);

      setWeb3Auth(web3AuthInstance)
      const conf = createConfig({
        chains: [baseSepolia],
        cacheTime: 3_600_000,
        transports: {
          [baseSepolia.id]: fallback([
            http('https://base-sepolia.g.alchemy.com/v2/U6YPO8eU2p26wRrvGyI2OlC1BS4ipA5o'),
            http('https://base-sepolia.g.alchemy.com/v2/vE7q6lsie-jRPZjFzbayQibbzicwO4uN'),
            http('https://base-sepolia.g.alchemy.com/v2/-DFmaAk_5jzgxCw7iYJ_VPr6VJq0RRFz'),
          ]),
        },
        connectors: [
          connector,
        ],
      });

      setConfig(conf);
    }

    init();
  }, [])

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      {config && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <div className="flex flex-col">
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange
              >
                <TBContext.Provider
                  value={{
                    web3Auth,
                    isOnMyDoc,
                    setIsOnMyDoc,
                    isOnSharedDoc,
                    setIsOnSharedDoc,
                    docData,
                    setDocData,
                    template,
                    setTemplate,
                    clause,
                    setClause,
                    isAuth,
                    setIsAuth
                  }}
                >
                  {pathName != "/home" && pathName != "/login" && pathName != "/register" && (
                    <Header />
                  )}
                  {children}
                </TBContext.Provider>
              </ThemeProvider>
              {/* <Footer /> */}
            </div>
          </QueryClientProvider>
        </WagmiProvider>
      )}
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default TBProvider