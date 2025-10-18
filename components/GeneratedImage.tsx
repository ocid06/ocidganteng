
import React from 'react';
import Spinner from './Spinner';

interface GeneratedImageProps {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ isLoading, error, imageUrl }) => {
  return (
    <div className="w-full mt-8 flex flex-col items-center">
        <h3 className="text-xl font-semibold text-light-text mb-4">Hasil</h3>
        <div className="w-full max-w-md aspect-square bg-dark-bg rounded-lg flex items-center justify-center border border-dark-border overflow-hidden">
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-medium-text">
                    <Spinner />
                    <p className="mt-2 text-sm">Merangkai visi Anda...</p>
                </div>
            )}
            {error && !isLoading && <p className="text-red-400 text-center px-4">{error}</p>}
            {!isLoading && !error && imageUrl && (
                <img src={imageUrl} alt="Generated" className="object-contain h-full w-full" />
            )}
            {!isLoading && !error && !imageUrl && (
                <div className="text-center text-medium-text p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.6-2.6L11.063 18l1.938-.648a3.375 3.375 0 002.6-2.6l.648-1.938 1.938.648a3.375 3.375 0 002.6 2.6l1.938.648-1.938.648a3.375 3.375 0 00-2.6 2.6z" />
                    </svg>
                    <p className="mt-2 text-sm">Gambar yang Anda hasilkan akan muncul di sini.</p>
                </div>
            )}
        </div>
        {imageUrl && !isLoading && (
            <a href={imageUrl} download="generated-image.jpg" className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-brand-light-purple to-brand-purple hover:opacity-90 transform hover:scale-105 transition-all">
                Unduh Gambar
            </a>
        )}
    </div>
  );
};

export default GeneratedImage;
