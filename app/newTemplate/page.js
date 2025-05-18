"use client"
import ReactLoading from "react-loading";
import Template from "@/components/templates/template";
import { template2, URLs } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
import ScrollBtn from "@/components/base/scrollBtn";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTBContext } from "@/context/Context";

export default function NewTemplate() {

  const container = useRef(null);
  const fileInputRef = useRef(null);

  const { template } = useTBContext();

  const [content, setContent] = useState(template2);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const router = useRouter();

  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

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

      const res = await axios.post(`${URLs.TBBackendTemplate}/createTemplate`, ({ address: address, signature: signature, message: message, data: content, title: title }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.isSuccess) {
        toast.success("Succesfully created the template.");
      } else {
        console.error("Upload failed:", res.data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
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

  const importPDF = () => {
    fileInputRef.current.click();
  };

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

        setContent([paragraph]);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  const initTemplate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(template);

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
    if (template) initTemplate();
  }, [template])

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
            <h2 className="text-xl font-semibold text-gray-200">New Template</h2>
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
                onClick={() => router.push('/myDocs')}
                className="border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={saveTemplate}
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Save Template
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-gray-200">Template Name</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter template name"
              className="bg-[#1a1d21] border-gray-700 text-gray-200 mt-2"
            />
          </div>
          <Template tempRef={container} content={content} setContent={setContent} />
        </div>
        <ScrollBtn bottom={12} />
      </div>
    </>
  );
}
