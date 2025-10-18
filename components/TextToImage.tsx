import React, { useState } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { useImageGeneration } from '../hooks/useImageGeneration';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';

const TextToImage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generate, { isLoading, error, imageUrl }] = useImageGeneration(generateImageFromText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    generate(prompt);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-light-text mb-2">Teks ke Gambar</h2>
      <p className="text-medium-text mb-6 text-center">Jelaskan gambar yang ingin Anda buat. Berikan deskripsi sedetail mungkin!</p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="contoh: Seekor singa agung memakai mahkota, fotorealistis, 4k"
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-light-text"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-light-purple to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Menghasilkan...' : 'Hasilkan Gambar'}
          </button>
        </div>
      </form>

      <GeneratedImage isLoading={isLoading} error={error} imageUrl={imageUrl} />
    </div>
  );
};

export default TextToImage;
