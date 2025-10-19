// services/geminiService.ts

// ... (kode di atas tetap sama, termasuk inisialisasi const ai) ...

/**
 * Generate gambar dari teks menggunakan model IMAGEN 3.0 (Memerlukan Billing Aktif).
 * Ini adalah satu-satunya model yang dirancang untuk Text-to-Image.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty.");
  }

  try {
    // ⚠️ PERBAIKAN: Menggunakan metode Imagen yang benar dan model spesifik
    const response = await ai.models.generateImages({
      // Menggunakan model Imagen 3.0
      model: "imagen-3.0-generate-002", 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        // Anda mungkin perlu menambahkan aspectRatio atau parameter lain di sini
      },
    });

    // Pengecekan respons IMAGEN (bukan respons Gemini)
    if (response.generatedImages && response.generatedImages.length > 0) {
      const generatedImage = response.generatedImages[0].image;
      const base64ImageBytes: string = generatedImage.imageBytes;
      const mimeType: string = generatedImage.mimeType;

      return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image data was successfully generated or found from Imagen.");
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    
    // Memberikan pesan error yang lebih jelas jika itu adalah masalah Billing/Model
    if (error.message && error.message.includes("400") || error.message.includes("Imagen API is only accessible to billed users")) {
        throw new Error("Gagal generate gambar. Fitur ini memerlukan aktivasi penagihan (billing) di Google Cloud untuk model Imagen.");
    }
    
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};
  } catch (error: any) {
    console.error("Error generating image from text:", error.message || error);
    // Jika masih 404, masalah ada pada konfigurasi SDK/API Key, BUKAN kode ini.
    throw new Error(`Failed to generate image: ${error.message || "Unknown API error"}`);
  }
};

// Catatan: Fungsi `editImageWithPrompt` dan `swapFaces` tetap dihapus 
// karena menyebabkan masalah build dan memerlukan model/endpoint yang berbeda.
  
