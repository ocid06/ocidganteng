// services/geminiService.ts

// ... (kode di atas tetap sama) ...

/**
 * Generate gambar dari teks menggunakan model GEMINI FLASH (Percobaan Terakhir untuk Free Tier).
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // ⚠️ KEMBALI KE FLASH: Jika ini gagal, masalahnya PASTI pada konfigurasi SDK/API.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        // PERINTAH LEBIH SPESIFIK: Menginstruksikan AI untuk menghasilkan gambar
        parts: [{ text: `Based on the following request, generate and return only the photorealistic image data: ${prompt}` }],
      },
      config: {
        responseModalities: [Modality.IMAGE], 
      },
    });
    
    // ... (kode pengecekan respons tetap sama) ...
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Gemini did not return image data for the given prompt. Model may not support image generation via this endpoint.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};
