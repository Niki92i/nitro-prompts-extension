"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  onFileUpload: (file: File) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PDFViewer({
  onFileUpload,
  onPageChange,
  currentPage,
  totalPages,
  isFullscreen,
  onToggleFullscreen,
}: PDFViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      onFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* Drag and Drop Area */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          isDragging ? "bg-primary/10" : "bg-transparent"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 rounded-lg border-2 border-dashed border-primary/50 bg-background/80 backdrop-blur-sm"
            >
              <FileUp className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-center">Drop your PDF here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-full hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-full hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-full hover:bg-primary/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".pdf"
        className="hidden"
      />
    </div>
  );
} 