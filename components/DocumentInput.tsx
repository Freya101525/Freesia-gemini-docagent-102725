import React, { useState, useCallback, useRef } from 'react';
import type { Document } from '../types';
import { extractTextFromImage } from '../services/apiService';

interface DocumentInputProps {
  document: Document;
  onUpdate: (id: number, content: string, fileName: string | null) => void;
  onGenerateSummary: (id: number) => void;
  setLoading: (loading: boolean, message: string) => void;
  setError: (error: string | null) => void;
}

const DocumentInput: React.FC<DocumentInputProps> = ({ document, onUpdate, onGenerateSummary, setLoading, setError }) => {
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePdfUpload = useCallback(async (file: File, fileName: string) => {
    setLoading(true, 'Analyzing PDF page(s)...');
    let combinedText = '';

    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      const firstPage = Math.max(1, startPage);
      const lastPage = Math.min(pdf.numPages, endPage);

      if (firstPage > lastPage) {
        setError(`Invalid page range. Start page must be less than or equal to end page.`);
        setLoading(false, '');
        return;
      }

      for (let i = firstPage; i <= lastPage; i++) {
        setLoading(true, `Analyzing PDF Page ${i} of ${lastPage}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas element not found.");
        
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error('Could not get canvas context');

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Image = dataUrl.split(',')[1];
        
        const extractedText = await extractTextFromImage(base64Image, 'image/jpeg');
        combinedText += `--- Page ${i} ---\n${extractedText}\n\n`;
      }
      
      const pageRange = startPage === endPage ? `Page ${startPage}` : `Pages ${startPage}-${endPage}`;
      onUpdate(document.id, combinedText, `${fileName} (${pageRange})`);

    } catch (error: any) {
      console.error('PDF processing error:', error);
      setError(error.message || 'Failed to process PDF file.');
    } finally {
      setLoading(false, '');
    }
  }, [document.id, onUpdate, startPage, endPage, setError, setLoading]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      await handlePdfUpload(file, fileName);
    } else if (['txt', 'md'].includes(fileExtension || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate(document.id, e.target?.result as string, fileName);
      };
      reader.readAsText(file);
    } else {
      setError('Unsupported file type. Please upload a .txt, .md, or .pdf file.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [document.id, onUpdate, setError, handlePdfUpload]);

  return (
    <div className="bg-[var(--primary-bg)] p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border border-[var(--border-color)]">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <h3 className="font-semibold text-[var(--primary-text)]">{document.title}</h3>
      <div className="mt-2 flex flex-col sm:flex-row gap-2 flex-wrap">
        <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
        >
          {document.fileName ? `Change File (${document.fileName})` : 'Upload File'}
        </button>
        <div className="flex items-center gap-2">
            <label htmlFor={`start-page-${document.id}`} className="text-sm text-[var(--secondary-text)]">PDF Pages:</label>
            <input
                id={`start-page-${document.id}`} type="number" min="1" value={startPage}
                onChange={(e) => setStartPage(parseInt(e.target.value, 10) || 1)}
                className="w-16 p-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] text-sm bg-[var(--primary-bg)] text-[var(--primary-text)]"
                title="Enter start page for PDF OCR"
            />
             <span className="text-sm text-[var(--secondary-text)]">-</span>
            <input
                id={`end-page-${document.id}`} type="number" min="1" value={endPage}
                onChange={(e) => setEndPage(parseInt(e.target.value, 10) || 1)}
                className="w-16 p-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] text-sm bg-[var(--primary-bg)] text-[var(--primary-text)]"
                title="Enter end page for PDF OCR"
            />
        </div>
      </div>
      <input type="file" accept=".txt,.md,.pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <textarea
        value={document.content}
        onChange={(e) => onUpdate(document.id, e.target.value, document.fileName)}
        placeholder="Paste text directly or upload a file..."
        className="mt-2 w-full h-40 p-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] bg-[var(--primary-bg)] text-[var(--primary-text)]"
      />
      <div className="mt-2 flex justify-end">
        <button onClick={() => onGenerateSummary(document.id)} disabled={!document.content} className="px-4 py-2 text-sm font-medium text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">
            Generate Summary
        </button>
      </div>
      {document.summary && (
        <div className="mt-2 p-3 bg-[var(--secondary-bg)] rounded-md border border-[var(--border-color)]">
            <p className="text-sm font-semibold text-[var(--primary-text)]">Summary:</p>
            <p className="text-sm text-[var(--secondary-text)] mt-1 whitespace-pre-wrap">{document.summary}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentInput;