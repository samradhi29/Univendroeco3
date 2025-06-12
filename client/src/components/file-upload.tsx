import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, File } from 'lucide-react';

interface FileUploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  folder?: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

interface UploadedFile {
  key: string;
  url: string;
  bucket: string;
  name: string;
  size: number;
  type: string;
}

export function FileUpload({ 
  onUpload, 
  folder = 'uploads', 
  multiple = false, 
  accept = 'image/*,application/pdf',
  maxSize = 5 * 1024 * 1024,
  className = '' 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(file => formData.append('files', file));
        formData.append('folder', folder);
        return apiRequest('POST', '/api/upload/multiple', formData);
      } else {
        formData.append('file', files[0]);
        formData.append('folder', folder);
        return apiRequest('POST', '/api/upload/single', formData);
      }
    },
    onSuccess: (data) => {
      const uploadedFiles = multiple ? data.files : [data.file];
      const filesWithMetadata = uploadedFiles.map((file: any, index: number) => ({
        ...file,
        name: acceptedFiles[index]?.name || 'Unknown',
        size: acceptedFiles[index]?.size || 0,
        type: acceptedFiles[index]?.type || 'unknown'
      }));
      
      setUploadedFiles(prev => [...prev, ...filesWithMetadata]);
      onUpload?.(filesWithMetadata);
      
      toast({
        title: "Upload Successful",
        description: `${uploadedFiles.length} file(s) uploaded to AWS S3`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      return apiRequest('DELETE', `/api/upload/${key}`);
    },
    onSuccess: (_, key) => {
      setUploadedFiles(prev => prev.filter(file => file.key !== key));
      toast({
        title: "File Deleted",
        description: "File removed from AWS S3",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);

  const onDrop = useCallback((files: File[]) => {
    setAcceptedFiles(files);
    uploadMutation.mutate(files);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  {accept} • Max size: {formatFileSize(maxSize)}
                  {multiple && ' • Multiple files allowed'}
                </p>
              </div>
            )}
          </div>
          
          {uploadMutation.isPending && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Uploading to AWS S3...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • Stored in AWS S3
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(file.key)}
                      disabled={deleteMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FileUpload;