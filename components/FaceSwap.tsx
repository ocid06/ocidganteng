import React, { useState } from 'react';
import { fileToBase64, swapFaces } from '../services/geminiService';
import { useImageGeneration } from '../hooks/useImageGeneration';
import ImageInput from './ImageInput';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';

interface SwapParams {
  sourceImage: { mimeType: string; data: string };
  targetImage: { mimeType: string; data: string };
}

// FIX: Create a wrapper function to adapt the swapFaces service method to the useImageGeneration hook's expected signature.
const swapFacesApi = (params: SwapParams) => swapFaces(params.sourceImage, params.targetImage);

const FaceSwap: React.FC = () => {
  const [sourceImageFile, setSourceImageFile] = useState<File[]>([]);
  const [targetImageFile, setTargetImageFile] = useState<File[]>([]);
  
  const [generate, { isLoading, error, imageUrl }] = useImageGeneration(
    swapFacesApi,
    'Gagal menukar wajah. Silakan coba lagi.'
  );

  const handleSourceChange = (files: File[]) => {
    setSourceImageFile(files);
  };
  
  const handleTargetChange = (files: File[]) => {
    setTargetImageFile(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceImageFile.length === 0 || targetImageFile.length === 0 || isLoading) return;

    const sourceImage = await fileToBase64(sourceImageFile[0]);
    const targetImage = await fileToBase64(targetImageFile[0]);

    generate({ sourceImage, targetImage });
  };

  const canSubmit = sourceImageFile.length > 0 && targetImageFile.length > 0 && !isLoading;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-light-text mb-2">Tukar Wajah</h2>
      <p className="text-medium-text mb-6 text-center">Unggah gambar sumber (wajah yang akan digunakan) dan gambar target.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <ImageInput 
            id="source-image-file" 
            label="Gambar Sumber (Wajah untuk Digunakan)" 
            onFileChange={handleSourceChange}
          />
          <ImageInput 
            id="target-image-file" 
            label="Gambar Target (Gambar untuk Ditempeli Wajah)" 
            onFileChange={handleTargetChange}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-light-purple to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Menukar...' : 'Tukar Wajah'}
          </button>
        </div>
      </form>

      <GeneratedImage isLoading={isLoading} error={error} imageUrl={imageUrl} />
    </div>
  );
};

export default FaceSwap;
