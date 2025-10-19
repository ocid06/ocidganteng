import { GoogleGenAI } from "@google/genai";

// ⚠️ PERBAIKAN UTAMA 1:
// Gunakan process.env untuk Serverless Function di Vercel, dan pastikan
// Environment Variable di Vercel bernama GEMINI_API_KEY (tanpa VITE_).
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// --- Fungsi Pendukung (TIDAK BERUBAH) ---

/**
 * Mengubah File menjadi base64 string beserta MIME type-nya.
 * (Asumsi fungsi ini dipanggil di sisi client/browser sebelum dikirim ke API Route)
 */
export const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(";")[0].split(":")[1];
      const data = result.split(",")[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Fungsi Generate Gambar (DI-UPGRADE) ---

/**
 * Generate gambar dari teks menggunakan model IMAGEN 3.0.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // ⚠️ PERBAIKAN UTAMA 2 & 3:
    // Mengganti model dan metode panggilan ke IMAGEN
    const response = await ai.models.generateImages({
      model: "gemini-2.5-flash-image", // Model Text-to-Image
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png", // PNG biasanya lebih disukai untuk kualitas
        // Anda bisa tambahkan konfigurasi lain seperti aspectRatio: "1:1"
      },
    });

    // Pengecekan respons IMAGEN
    if (response.generatedImages && response.generatedImages.length > 0) {
      const generatedImage = response.generatedImages[0].image;
      const base64ImageBytes: string = generatedImage.imageBytes;
      const mimeType: string = generatedImage.mimeType;

      // Mengembalikan URL Data Base64 untuk ditampilkan di browser
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image data was successfully generated or found in the response.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    // Kembalikan pesan error yang lebih informatif dari sistem jika memungkinkan
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};

// Catatan: Fungsi `editImageWithPrompt` dan `swapFaces` yang lama
// telah dihapus karena memerlukan API dan model Imagen yang berbeda 
// dan di luar cakupan generateImages sederhana.
      
