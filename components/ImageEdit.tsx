import React, { useState } from 'react';
import { fileToBase64, editImageWithPrompt } from '../services/geminiService'; // Sudah bisa diimpor lagi
import { useImageGeneration } from '../hooks/useImageGeneration';
import ImageInput from './ImageInput';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';

interface EditParams {
  images: { mimeType: string; data: string }[];
  prompt: string;
}

// Wrapper function to adapt the service method to the hook's expected signature.
const editImageApi = (params: EditParams) => editImageWithPrompt(params.images, params.prompt);

const ImageEdit: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [generate, { isLoading, error, imageUrl }] = useImageGeneration(editImageApi);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || imageFiles.length === 0 || isLoading) return;

    // Konversi semua file gambar ke Base64
    const base64DataPromises = imageFiles.map(file => fileToBase64(file));
    const base64DataArray = await Promise.all(base64DataPromises);
    generate({ images: base64DataArray, prompt });
  };

  const canSubmit = prompt.trim() && imageFiles.length > 0 && !isLoading;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-light-text mb-2">Edit Gambar</h2>
      <p className="text-medium-text mb-6 text-center">Unggah satu atau lebih gambar dan beri tahu AI bagaimana Anda ingin mengubahnya.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col gap-4">
          <ImageInput id="image-edit-file" label="Unggah Gambar" onFileChange={setImageFiles} multiple />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="contoh: Jadikan gambar pertama lukisan cat air, gunakan gaya gambar kedua."
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-light-text"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-light-purple to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Mengedit...' : 'Terapkan Edit'}
          </button>
        </div>
      </form>

      <GeneratedImage isLoading={isLoading} error={error} imageUrl={imageUrl} />
    </div>
  );
};

export default ImageEdit;
