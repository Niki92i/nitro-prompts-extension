"use client";

import { useState } from "react";
import { PDFViewer } from "@/components/pdf/PDFViewer";
import { PDFRenderer } from "@/components/pdf/PDFRenderer";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setCurrentFile(file);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePageCountChange = (count: number) => {
    setTotalPages(count);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="aspect-[4/3] w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg">
          {currentFile ? (
            <PDFRenderer
              file={currentFile}
              currentPage={currentPage}
              onPageCountChange={handlePageCountChange}
              className="h-full"
            />
          ) : (
            <PDFViewer
              onFileUpload={handleFileUpload}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}
        </div>
      </div>
    </main>
  );
} 