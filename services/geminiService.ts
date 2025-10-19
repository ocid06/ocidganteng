import { GoogleGenAI, Modality } from "@google/genai";

// 1. VERIFIKASI API KEY
// Pastikan variabel GEMINI_API_KEY sudah dimasukkan di Vercel.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ---------------------------------------------------------------------
// FUNGSI PENDUKUNG (Client-Side) - DIPERBAIKI AGAR BUILD BERHASIL
// ---------------------------------------------------------------------

/**
 * Mengubah File menjadi base64 string beserta MIME type-nya.
 * (Diperlukan oleh komponen ImageEdit/FaceSwap)
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
 * Catatan: Model ini TIDAK dirancang untuk Text-to-Image dan kemungkinan besar
 * akan menghasilkan error "This model only supports text output."
 * Solusi resminya adalah menggunakan Imagen 3.0 dengan billing aktif.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    const response = await ai.models.generateContent({
      // Menggunakan model terbaru yang seharusnya didukung di Free Tier
      model: "gemini-2.5-flash", 
      contents: {
        parts: [{ text: `Generate a photorealistic image based on this description: ${prompt}` }],
      },
      config: {
        responseModalities: [Modality.IMAGE], 
      },
    });

    // Pengecekan respons
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Gemini did not return image data, model may only support text output (Switch to Imagen 3.0 required).");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    // Memberikan pesan error yang lebih informatif
    const msg = error.message || "Unknown API error";
    if (msg.includes("404") || msg.includes("not found")) {
        throw new Error("Model API tidak ditemukan. Harap buat API Key baru di Google AI Studio.");
    }
    if (msg.includes("text output")) {
        throw new Error("Model ini hanya mendukung output teks. Aktifkan billing untuk menggunakan model Imagen.");
    }
    
    throw new Error(`Failed to generate image: ${msg}`);
  }
};
        data: image.data,
        mimeType: image.mimeType,
      },
    }));

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('No image data found in the response.');
  } catch (error) {
    console.error('Error editing image with prompt:', error);
    throw new Error('Failed to edit image. Please try again.');
  }
};

/**
 * Swaps faces between a source and a target image.
 * @param sourceImage The image containing the face to use.
 * @param targetImage The image where the face will be placed.
 * @returns A promise that resolves to the data URL of the resulting image.
 */
export const swapFaces = async (
  sourceImage: { mimeType: string; data: string },
  targetImage: { mimeType: string; data: string }
): Promise<string> => {
  try {
    const sourceImagePart = {
      inlineData: {
        data: sourceImage.data,
        mimeType: sourceImage.mimeType,
      },
    };

    const targetImagePart = {
      inlineData: {
        data: targetImage.data,
        mimeType: targetImage.mimeType,
      },
    };

    const textPart = { text: "Take the face from the first image and swap it onto the main person in the second image. Keep the background and body of the second image." };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [sourceImagePart, targetImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('No image data found in the response.');
  } catch (error) {
    console.error('Error swapping faces:', error);
    throw new Error('Failed to swap faces. Please try again.');
  }
};
