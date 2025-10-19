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
// FUNGSI UTAMA (Serverless) - GENERATE GAMBAR (FINAL SOLUTION)
// ---------------------------------------------------------------------

/**
 * Generate gambar dari teks menggunakan model Pratinjau Gambar yang Tersedia.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // Menggunakan model Gambar Pratinjau yang ada di daftar model Anda
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", 
      contents: {
        parts: [{ text: `Generate a high-quality, photorealistic image based on this description: ${prompt}` }],
      },
      config: {
        // ⚠️ PERBAIKAN: Harus meminta TEXT dan IMAGE secara bersamaan
        responseModalities: [Modality.TEXT, Modality.IMAGE], 
      },
    });

    // Pengecekan respons Gemini untuk mencari data gambar
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            // Kita hanya mencari bagian yang memiliki data inline (gambar)
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Model berhasil dipanggil, tetapi tidak mengembalikan data gambar. Kuota mungkin habis.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    // Pesan khusus jika kuota habis (10 RPM yang tertera di screenshot)
    if (error.message && error.message.includes("quota")) {
        throw new Error("Gagal: Kuota generate gambar (10 RPM) mungkin habis. Silakan coba lagi nanti.");
    }

    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};
