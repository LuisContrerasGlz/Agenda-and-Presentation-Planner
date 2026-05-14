import React, { useCallback, useState } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onFileProcessed: (text: string, fileName: string) => void;
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-doc', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process file');
      }

      const data = await response.json();
      onFileProcessed(data.text, data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer",
          isDragging ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400 bg-white",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={onFileChange}
          accept=".docx,.pptx,.md,.txt"
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
            <p className="text-sm font-medium text-neutral-500">Extracting content...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-neutral-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-neutral-900">Drop your document here</p>
              <p className="text-sm text-neutral-500 mt-1">Supports DOCX, PPTX, MD, and TXT</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
