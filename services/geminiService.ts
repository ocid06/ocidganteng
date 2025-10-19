import { GoogleGenAI } from "@google/genai";

// 1. VERIFIKASI API KEY
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ---------------------------------------------------------------------
// FUNGSI PENDUKUNG (Client-Side) - Wajib untuk komponen Anda
// ---------------------------------------------------------------------

/**
 * Mengubah File menjadi base64 string.
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

// ---------------------------------------------------------------------
// FUNGSI UTAMA (Serverless) - GENERATE GAMBAR DENGAN IMAGEN
// ---------------------------------------------------------------------

/**
 * Generate gambar dari teks menggunakan model IMAGEN 3.0 (Memerlukan Billing Aktif).
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // Menggunakan metode dan model yang dirancang untuk Text-to-Image
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002", 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
      },
    });

    // Pengecekan respons Imagen
    if (response.generatedImages && response.generatedImages.length > 0) {
      const generatedImage = response.generatedImages[0].image;
      const base64ImageBytes: string = generatedImage.imageBytes;
      const mimeType: string = generatedImage.mimeType;

      return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image data was successfully generated from Imagen.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    // Memberikan pesan error yang jelas jika billing belum aktif
    if (error.message && error.message.includes("Imagen API is only accessible to billed users")) {
        throw new Error("Gagal. Harap aktifkan PENAGIHAN (BILLING) di Google Cloud untuk menggunakan model Imagen.");
    }
    
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};
        
