import { GoogleGenAI, Modality } from "@google/genai";

// ⚠️ PERBAIKAN: Menggunakan process.env untuk Serverless Function di Vercel.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    // Ini akan melempar error saat deploy jika API key tidak ada di Vercel
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ---------------------------------------------------------------------
// FUNGSI PENDUKUNG (Client-Side) - WAJIB ADA UNTUK MENGATASI BUILD ERROR
// ---------------------------------------------------------------------

/**
 * Mengubah File menjadi base64 string beserta MIME type-nya.
 * Fungsi ini harus diekspor agar komponen ImageEdit/FaceSwap dapat mengimpornya.
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
// FUNGSI UTAMA (Serverless) - GENERATE GAMBAR
// ---------------------------------------------------------------------

/**
 * Generate gambar dari teks menggunakan model GEMINI FLASH.
 * Ini adalah percobaan terakhir untuk Free Tier karena model Imagen memerlukan billing.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "imagen-3.0-generate-002", 
      contents: {
        // Menginstruksikan AI untuk menghasilkan gambar yang realistis
        parts: [{ text: `Based on the following request, generate and return only the photorealistic image data: ${prompt}` }],
      },
      config: {
        // Kunci untuk meminta output berupa gambar
        responseModalities: [Modality.IMAGE], 
      },
    });

    // Pengecekan respons Gemini untuk mendapatkan data gambar
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Gemini did not return image data. Model may not fully support image generation.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    // Jika masih 404, masalah ada pada konfigurasi SDK/API Key, BUKAN kode ini.
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};

// Catatan: Fungsi `editImageWithPrompt` dan `swapFaces` tetap dihapus 
// karena menyebabkan masalah build dan memerlukan model/endpoint yang berbeda.
  
