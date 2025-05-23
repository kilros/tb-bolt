"use client";

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { DocumentEditor } from '@/components/document-editor';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import html2pdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import { Upload, Download, FileText, X } from 'lucide-react';

export default function NewClausePage() {
  const [clauseContent, setClauseContent] = useState('');
  const [clauseName, setClauseName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf') {
      setUploadedFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        let text = '';
        
        // In a real implementation, you would extract text from PDF
        // For now, we'll create a simple placeholder
        text = `<h1>${file.name}</h1>
                <p>Imported PDF content would appear here.</p>
                <p>Number of pages: ${pages.length}</p>`;
        
        setClauseContent(text);
        setClauseName(file.name.replace('.pdf', ''));
        toast.success('PDF imported successfully');
      } catch (error) {
        console.error('Error reading PDF:', error);
        toast.error('Failed to read PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const pdfContent = html2pdfmake(clauseContent);
      pdfMake.createPdf(pdfContent).download(`${clauseName || 'clause'}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleSaveClause = () => {
    if (!clauseName.trim()) {
      toast.error('Please enter a clause name');
      return;
    }

    if (!clauseContent.trim()) {
      toast.error('Clause content cannot be empty');
      return;
    }

    toast.success('Clause saved successfully');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-[#2a2d35] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200">New Clause</h2>
            <div className="flex gap-3">
              <div
                {...getRootProps()}
                className="cursor-pointer"
              >
                <input {...getInputProps()} />
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import PDF
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClause}
                className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black"
              >
                Save Clause
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="clauseName" className="text-gray-200">Clause Name</Label>
            <Input
              id="clauseName"
              value={clauseName}
              onChange={(e) => setClauseName(e.target.value)}
              placeholder="Enter clause name"
              className="bg-[#1a1d21] border-gray-700 text-gray-200 mt-2"
            />
          </div>

          {uploadedFile && (
            <div className="mb-4 p-3 bg-[#1a1d21] rounded-lg border border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#FFB800] mr-2" />
                <span className="text-gray-200">{uploadedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUploadedFile(null)}
                className="h-8 w-8 text-gray-400 hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DocumentEditor
            content={clauseContent}
            onChange={setClauseContent}
          />
        </div>
      </div>
    </div>
  );
}