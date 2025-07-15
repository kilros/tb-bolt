"use client"
import "./globals.css";
import React, { useState } from "react";

import { ToastContainer } from "react-toastify";

import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS

import { TBContext } from "../context/Context";
import { ThemeProvider } from "@/components/theme-provider";


function TBProvider({ children }) {
  const [isOnMyDoc, setIsOnMyDoc] = useState(false);
  const [isOnSharedDoc, setIsOnSharedDoc] = useState(false);
  const [docData, setDocData] = useState(null);

  const [template, setTemplate] = useState(null);
  const [clause, setClause] = useState(null);

  const [isAuth, setIsAuth] = useState(false);


  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <div className="flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TBContext.Provider
            value={{
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
            {children}
          </TBContext.Provider>
        </ThemeProvider>
      </div>
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