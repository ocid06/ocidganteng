import { GoogleGenAI, Modality } from "@google/genai";

// 1. VERIFIKASI API KEY
// Mengambil kunci API dari Environment Variable Vercel.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ---------------------------------------------------------------------
// FUNGSI PENDUKUNG (Client-Side) - WAJIB ADA
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
// FUNGSI UTAMA (Serverless) - GENERATE GAMBAR (SOLUSI GRATIS TERBAIK)
// ---------------------------------------------------------------------

/**
 * Generate gambar dari teks menggunakan model Pratinjau Gambar yang Tersedia.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // ⚠️ INI ADALAH SOLUSI TERBAIK ANDA BERDASARKAN DAFTAR MODEL YANG DIIZINKAN
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", 
      contents: {
        parts: [{ text: `Generate a photorealistic image based on this description: ${prompt}` }],
      },
      config: {
        responseModalities: [Modality.IMAGE], 
      },
    });

    // Pengecekan respons Gemini
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Model gagal mengembalikan data gambar. Kuota mungkin habis (10 RPM).");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    // Memberikan pesan error yang lebih jelas
    const msg = error.message || "Unknown API error";
    
    // Jika masih 404, berarti ada masalah di SDK/API Key, meskipun model sudah benar
    if (msg.includes("404") || msg.includes("not found")) {
        throw new Error("Model tidak ditemukan. Harap pastikan API Key Anda terbaru.");
    }

    throw new Error(`Failed to generate image: ${msg}`);
  }
};
        
