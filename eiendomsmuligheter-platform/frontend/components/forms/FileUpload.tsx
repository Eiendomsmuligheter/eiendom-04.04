"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, X, FileText, Image, File, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  uploadText?: string;
  dragActiveText?: string;
}

export const FileUpload = ({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10 MB default
  acceptedFileTypes = ['image/*', 'application/pdf'],
  className = '',
  uploadText = 'Dra og slipp bilder her, eller klikk for å velge',
  dragActiveText = 'Slipp filene her...'
}: FileUploadProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    if (acceptedFiles?.length) {
      const newFiles = [...files];
      let hasNewFiles = false;
      
      // Check if we exceed the max files count
      if (newFiles.length + acceptedFiles.length > maxFiles) {
        setErrors(prev => [...prev, `Maksimalt ${maxFiles} filer er tillatt`]);
        return;
      }

      // Process each accepted file
      acceptedFiles.forEach(file => {
        // Check if file already exists by name
        const exists = newFiles.some(f => f.name === file.name);
        if (!exists) {
          newFiles.push(file);
          hasNewFiles = true;
        }
      });

      if (hasNewFiles) {
        setFiles(newFiles);
        onFilesSelected(newFiles);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    }

    // Handle rejected files
    if (rejectedFiles?.length) {
      const errorMessages = rejectedFiles.map(rejection => {
        const { file, errors } = rejection;
        return errors.map((e: { message: string }) => `${file.name}: ${e.message}`).join(', ');
      });
      setErrors(errorMessages);
      
      // Clear errors after 5 seconds
      setTimeout(() => setErrors([]), 5000);
    }
  }, [files, maxFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(file => file !== fileToRemove);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-400" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-400" />;
    } else {
      return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50/5' 
            : 'border-gray-300/20 hover:border-blue-300/30 hover:bg-blue-50/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <Cloud className={`h-12 w-12 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
          <div className="space-y-2">
            <p className="text-base text-gray-300">
              {isDragActive ? dragActiveText : uploadText}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFileTypes.join(', ')} • Maks {maxFiles} filer • Maks {Math.round(maxSize / (1024 * 1024))} MB
            </p>
          </div>
        </div>
      </div>

      {/* Display errors if any */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Show success message when files are uploaded */}
        {uploadSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-sm text-green-400">
                Filene ble lastet opp
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display uploaded files */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Opplastede filer</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 border border-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  className="p-1 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 