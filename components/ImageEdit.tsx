import React, { useState } from 'react';
// HANYA IMPORT fileToBase64, karena editImageWithPrompt sudah dihapus di service.
// Jika fileToBase64 juga tidak diperlukan di komponen ini, sebaiknya dihapus juga.
import { fileToBase64 } from '../services/geminiService';
// Import fungsi yang dibutuhkan
import ImageInput from './ImageInput';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';

interface EditParams {
  images: { mimeType: string; data: string }[];
  prompt: string;
}

// Catatan: Karena fungsi editImageWithPrompt telah dihapus di service,
// kita akan membuat fungsi dummy untuk menghindari error saat build.
// Ini akan memastikan build Vercel Anda berhasil.
const editImageApi = async (params: EditParams): Promise<string> => {
    // Console log untuk debugging jika fungsi ini terpanggil
    console.warn("Fungsi edit gambar sementara dimatikan karena perubahan API.");
    // Lempar error agar pengguna tahu fitur ini tidak berfungsi.
    throw new Error("Fitur edit gambar sementara tidak tersedia. Silakan gunakan fitur generate gambar.");
};

// Hook useImageGeneration memerlukan implementasi di file hooks/useImageGeneration.
// Agar kode ini berjalan, kita perlu mendefinisikan implementasi useImageGeneration 
// yang sesuai dengan signature barunya, namun untuk tujuan perbaikan build, 
// kita asumsikan hooks ini sudah benar.

// Asumsi: useImageGeneration di sini adalah import yang VALID
import { useImageGeneration } from '../hooks/useImageGeneration'; 


const ImageEdit: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Menggunakan fungsi dummy di atas (editImageApi)
  const [generate, { isLoading, error, imageUrl }] = useImageGeneration(editImageApi);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || imageFiles.length === 0 || isLoading) return;

    // Menangani konversi file ke base64 (tetap dipertahankan)
    try {
        const base64DataPromises = imageFiles.map(file => fileToBase64(file));
        const base64DataArray = await Promise.all(base64DataPromises);
        generate({ images: base64DataArray, prompt });
    } catch (err) {
        console.error("Failed to process files:", err);
        // Tambahkan state error lokal jika perlu untuk menampilkan pesan ke pengguna.
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-light-text mb-2">Edit Gambar (Sementara Dinonaktifkan)</h2>
      <p className="text-medium-text mb-6 text-center">
        Fitur ini dimatikan sementara karena API harus di-upgrade ke model Imagen 3.0.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col gap-4">
          <ImageInput id="image-edit-file" label="Unggah Gambar" onFileChange={setImageFiles} multiple />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="contoh: Jadikan gambar pertama lukisan cat air, gunakan gaya gambar kedua."
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-light-text"
            rows={3}
            disabled={true} // Nonaktifkan input agar pengguna tidak mencoba
          />
          <button
            type="submit"
            disabled={true} // Tombol dinonaktifkan
            className="w-full flex justify-center items-center gap-2 bg-gray-500 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed"
          >
            Fitur Tidak Tersedia
          </button>
        </div>
      </form>

      <GeneratedImage isLoading={isLoading} error={error} imageUrl={imageUrl} />
    </div>
  );
};

export default ImageEdit;
