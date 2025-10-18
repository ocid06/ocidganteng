import { useState, useCallback } from 'react';

type GenerationResult = {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
};

/**
 * A custom hook to handle the state management for AI image generation.
 * @param generationFn The asynchronous API function that generates an image and returns its URL.
 * @param errorMessage A custom error message for the catch block.
 * @returns A tuple containing the trigger function and the state object.
 */
export const useImageGeneration = <T,>(
  generationFn: (params: T) => Promise<string>,
  errorMessage: string = 'Terjadi kesalahan yang tidak terduga.'
): [(params: T) => Promise<void>, GenerationResult] => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generate = useCallback(async (params: T) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generationFn(params);
      setImageUrl(url);
    } catch (err: any) {
      setError(err.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [generationFn, errorMessage]);

  return [generate, { isLoading, error, imageUrl }];
};
