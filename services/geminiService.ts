import { GoogleGenAI } from "@google/genai";

// 1. VERIFIKASI API KEY
// Mengambil kunci API dari Environment Variable Vercel.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ---------------------------------------------------------------------
// FUNGSI PENDUKUNG (Client-Side) - WAJIB ADA UNTUK MENGATASI BUILD ERROR
// ---------------------------------------------------------------------

/**
 * Mengubah File lokal menjadi base64 string beserta MIME type-nya.
 * (Diperlukan oleh komponen ImageEdit/FaceSwap di sisi client)
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
// FUNGSI UTAMA (Serverless) - GENERATE GAMBAR DENGAN IMAGEN 3.0
// ---------------------------------------------------------------------

/**
 * Generate gambar dari teks menggunakan model IMAGEN 3.0 (Memerlukan Billing Aktif).
 * Ini adalah satu-satunya model yang berfungsi untuk Text-to-Image Generation.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // Menggunakan metode dan model yang dirancang khusus untuk Text-to-Image
    const response = await ai.models.generateImages({
      model: "gemini-2.5-flash-image", 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        // Anda dapat menambahkan konfigurasi seperti aspectRatio: "16:9" di sini
      },
    });

    // Pengecekan respons Imagen
    if (response.generatedImages && response.generatedImages.length > 0) {
      const generatedImage = response.generatedImages[0].image;
      const base64ImageBytes: string = generatedImage.imageBytes;
      const mimeType: string = generatedImage.mimeType;

      // Mengembalikan URL Data Base64
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image data was successfully generated from Imagen 3.0.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    const msg = error.message || "Unknown API error";
    
    // Pesan error khusus jika masalah billing muncul lagi
    if (msg.includes("billed users")) {
        throw new Error("Gagal. Fitur ini memerlukan penagihan (billing) aktif. Silakan verifikasi status billing Cloud Project Anda.");
    }
    
    // Pesan error khusus jika model tidak ditemukan lagi (walaupun seharusnya tidak terjadi)
    if (msg.includes("404") || msg.includes("not found")) {
        throw new Error("Model API tidak ditemukan. Harap pastikan API Key Anda terhubung ke endpoint yang benar.");
    }

    throw new Error(`Failed to generate image: ${msg}`);
  }
};
