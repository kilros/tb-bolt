"use client"
import ReactLoading from "react-loading";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { useReactToPrint } from "react-to-print";

import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { clause1, URLs } from "../../utils/constants.js";
import { useAccount, useSignMessage } from "wagmi";
import Clause from "./clause.jsx";
import { Toolbar } from "./components.jsx";
import { useTBContext } from "@/context/Context.js";
import { createEditor } from "slate";

export default function ClauseLib({
  cancel = () => { },
}) {

  const container = useRef(null);

  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const { clause } = useTBContext();

  const [activeEditor, setActiveEditor] = useState({ editor: createEditor() });
  const [content, setContent] = useState(clause1);
  const [title, setTitle] = useState('');
  const [key, setKey] = useState(0);
  // const { isAuthenticated } = useTBContext();
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  const importPDF = () => {
    fileInputRef.current.click();
  };

  const updateClause = (index, data) => {
    setContent(data);
  }

  const handlePrint = useReactToPrint({
    pageStyle: `@media print {
            @page {
                size: 1150px 1414px;
                margin: 25mm 20mm 20mm 20mm;
            }
        }`,
    content: () => container.current,
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          text.items.forEach(item => {
            textContent += item.str;
            if (item.hasEOL) {
              textContent += '\n';
            }
          });
        }

        // Insert text into Slate Editor
        const paragraph = textContent.split(/\n/).map((line) => ({
          type: "paragraph",
          align: "left",
          children: [{ text: line }],
        }));

        setKey(key + 1);
        setContent(paragraph);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  const saveTemplate = async () => {
    setIsLoading(true);
    try {
      if (title.trim() == "") {
        toast.error("Please enter title!");
        setIsLoading(false);
        return;
      }

      const message = `Authorize upload at ${Date.now()}`;

      let signature;
      try {
        signature = await signMessageAsync({ message });
      } catch {
        toast.error("Please sign in at first!");
      }

      const res = await axios.post(`${URLs.TBBackendClause}/createClause`, ({ address: address, signature: signature, message: message, data: content, title: title }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.isSuccess) {
        toast.success("Succesfully created the clause.");
      } else {
        console.error("Upload failed:", res.data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  }

  const initClause = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(clause);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();

      setContent(jsonData)

    } catch (error) {
      console.log(error)
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (clause) initClause();
  }, [clause])

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#000" />
        </div>
      )}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-[#2a2d35] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200">New Clause</h2>
            <div className="flex gap-3">
              <div
                className="cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={e => handleFileUpload(e)}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                  onClick={importPDF}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import PDF
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={cancel}
                className="border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={saveTemplate}
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Create
              </Button>
            </div>
          </div>
          <div className="mb-6">
            <Label className="text-gray-200">Clause Name</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter clause name"
              className="bg-[#1a1d21] border-gray-700 text-gray-200 mt-2"
            />
          </div>
          <div className="flex flex-col gap-4">
            {activeEditor.editor && (
              <div className="sticky top-0 z-20">
                <Toolbar className="flex flex-wrap border-b border-gray-700 gap-4 p-2 bg-[#2a2d35]" editor={activeEditor.editor} />
              </div>
            )}
            <div className="flex flex-col pt-12 pb-6 px-2 bg-white" ref={container}>
              <Clause content={content} setContent={updateClause} setEditor={setActiveEditor} key={key} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}