import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a base64 encoded string with its MIME type.
 * @param file The file to convert.
 * @returns A promise that resolves to an object containing the mimeType and base64 data.
 */
export const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(';')[0].split(':')[1];
      const data = result.split(',')[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates an image from a text prompt.
 * @param prompt The text prompt.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
    throw new Error('No image data found in the response.');
  } catch (error) {
    console.error('Error generating image from text:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
};

/**
 * Edits an image based on a text prompt.
 * @param images An array of image objects with mimeType and base64 data.
 * @param prompt The text prompt describing the desired edits.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const editImageWithPrompt = async (
  images: { mimeType: string; data: string }[],
  prompt: string
): Promise<string> => {
  try {
    const imageParts = images.map(image => ({
      inlineData: {
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
