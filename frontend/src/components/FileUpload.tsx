'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileAudio, FileVideo } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { isValidMediaFile, formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (isValidMediaFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Invalid file type. Please upload an audio or video file.');
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isAudio = selectedFile?.type.startsWith('audio/');

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="audio/*,video/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900">
              <Upload className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            
            <div>
              <p className="text-lg font-semibold mb-1">{t('upload_description')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('supported_formats')}
              </p>
            </div>
            
            <button
              type="button"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              {t('upload_button')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900">
            {isAudio ? (
              <FileAudio className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            ) : (
              <FileVideo className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

