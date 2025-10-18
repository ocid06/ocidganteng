
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageInputProps {
  id: string;
  label: string;
  onFileChange: (files: File[]) => void;
  multiple?: boolean;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);


const ImageInput: React.FC<ImageInputProps> = ({ id, label, onFileChange, multiple = false }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This effect will run whenever the `files` state changes.
    // It's responsible for generating the data URLs for the image previews.
    const newPreviews: string[] = [];
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    let loadedCount = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // We store the result at the correct index to maintain order.
        newPreviews[index] = reader.result as string;
        loadedCount++;
        if (loadedCount === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

  }, [files]);


  const handleFileProcessing = useCallback((incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const imageFiles = Array.from(incomingFiles).filter(file => file.type.startsWith('image/'));
    
    setFiles(currentFiles => {
        // If multiple are allowed, append the new files. Otherwise, replace.
        const updatedFiles = multiple ? [...currentFiles, ...imageFiles] : imageFiles;
        // Notify the parent component with the complete list of files.
        onFileChange(updatedFiles);
        return updatedFiles;
    });

    // Reset the file input value. This allows the user to select the same file again
    // if they remove it and want to re-add it.
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [multiple, onFileChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileProcessing(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileProcessing(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const removeImage = (indexToRemove: number) => {
    setFiles(currentFiles => {
        const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
        onFileChange(updatedFiles);
        return updatedFiles;
    });
  }

  const openFileDialog = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-medium-text mb-2">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative w-full p-2 border-2 border-dark-border border-dashed rounded-md transition-colors duration-300 hover:border-brand-light-purple ${previews.length === 0 ? 'h-48' : ''}`}
      >
        {previews.length === 0 ? (
          <div onClick={openFileDialog} className="flex flex-col justify-center items-center w-full h-full cursor-pointer">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-400">
                  <p className="pl-1">Unggah file atau seret dan lepas</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
              </div>
          </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                {previews.map((src, index) => (
                    <div key={src + index} className="relative aspect-square group">
                        <img src={src} alt={`Preview ${index + 1}`} className="object-cover h-full w-full rounded-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button type="button" onClick={() => removeImage(index)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
                {multiple && (
                    <div onClick={openFileDialog} className="flex justify-center items-center aspect-square bg-dark-bg border-2 border-dashed border-dark-border rounded-md cursor-pointer hover:border-brand-light-purple transition-colors">
                        <div className="text-center text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-xs mt-1 block">Tambah lagi</span>
                        </div>
                    </div>
                 )}
            </div>
        )}
        <input
          id={id}
          name={id}
          type="file"
          accept="image/*"
          className="sr-only"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
        />
      </div>
    </div>
  );
};

export default ImageInput;
