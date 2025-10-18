import { GoogleGenAI, Modality } from "@google/genai";

// ✅ Fix: Vite environment variable harus pakai prefix VITE_
// Pastikan di .env.local atau di Vercel ada:  VITE_GEMINI_API_KEY=AIza...
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY as string,
});

/**
 * Mengubah File menjadi base64 string beserta MIME type-nya.
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

/**
 * Generate gambar dari teks.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
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

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Error generating image from text:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

/**
 * Edit gambar berdasarkan prompt teks.
 */
export const editImageWithPrompt = async (
  images: { mimeType: string; data: string }[],
  prompt: string
): Promise<string> => {
  try {
    const imageParts = images.map((image) => ({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    }));

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Error editing image with prompt:", error);
    throw new Error("Failed to edit image. Please try again.");
  }
};

/**
 * Swap wajah antara dua gambar.
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

    const textPart = {
      text: "Take the face from the first image and swap it onto the main person in the second image. Keep the background and body of the second image.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Error swapping faces:", error);
    throw new Error("Failed to swap faces. Please try again.");
  }
};
