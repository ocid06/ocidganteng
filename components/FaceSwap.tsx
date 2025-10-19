import React, { useState } from 'react';
// PERBAIKAN: Menghapus 'swapFaces' karena sudah dihapus dari geminiService.ts
import { fileToBase64 } from '../services/geminiService'; 
import { useImageGeneration } from '../hooks/useImageGeneration';
import ImageInput from './ImageInput';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';

interface SwapParams {
  sourceImage: { mimeType: string; data: string };
  targetImage: { mimeType: string; data: string };
}

// FUNGSI DUMMY SEMENTARA: Menggantikan swapFaces. Ini akan membuat build berhasil
// tetapi akan memberikan error yang jelas di UI jika pengguna mencoba fitur ini.
const swapFacesApi = async (params: SwapParams): Promise<string> => {
    console.warn("Fungsi swap wajah sementara dinonaktifkan untuk memperbaiki build.");
    // Melemparkan error yang akan ditangkap oleh useImageGeneration hook
    throw new Error("Fitur Tukar Wajah sementara tidak tersedia (Dinonaktifkan). Silakan gunakan fitur Generate Gambar.");
};

const FaceSwap: React.FC = () => {
  const [sourceImageFile, setSourceImageFile] = useState<File[]>([]);
  const [targetImageFile, setTargetImageFile] = useState<File[]>([]);
  
  // Menggunakan fungsi dummy di atas (swapFacesApi)
  const [generate, { isLoading, error, imageUrl }] = useImageGeneration(
    swapFacesApi,
    // Pesan error ini sekarang akan ditampilkan jika fungsi dummy dipanggil.
    'Gagal menukar wajah. Fitur dinonaktifkan sementara.' 
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

    // fileToBase64 tetap aman karena diekspor di geminiService.ts
    const sourceImage = await fileToBase64(sourceImageFile[0]);
    const targetImage = await fileToBase64(targetImageFile[0]);

    // Panggil fungsi dummy (swapFacesApi)
    generate({ sourceImage, targetImage });
  };

  // Kita set canSubmit selalu false agar tombol tidak bisa diklik
  const canSubmit = false; 

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-light-text mb-2">Tukar Wajah (Dinonaktifkan)</h2>
      <p className="text-medium-text mb-6 text-center">
        Fitur ini dinonaktifkan sementara. Silakan beralih ke fitur **Generate Gambar**.
      </p>
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
            // Tombol dinonaktifkan total agar tidak ada panggilan ke fungsi dummy
            disabled={true} 
            className="w-full flex justify-center items-center gap-2 bg-gray-500 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed"
          >
            Fitur Dinonaktifkan
          </button>
        </div>
      </form>

      <GeneratedImage isLoading={isLoading} error={error} imageUrl={imageUrl} />
    </div>
  );
};

export default FaceSwap;
    
