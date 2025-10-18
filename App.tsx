import React, { useState, useCallback } from 'react';
import { Feature } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import TextToImage from './components/TextToImage';
import ImageEdit from './components/ImageEdit';
// FIX: Import the FaceSwap component to make it available for routing.
import FaceSwap from './components/FaceSwap';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.TextToImage);

  const renderFeature = useCallback(() => {
    switch (activeFeature) {
      case Feature.TextToImage:
        return <TextToImage />;
      case Feature.ImageToImage:
        return <ImageEdit />;
      // FIX: Add a case to render the FaceSwap component when the corresponding tab is active.
      case Feature.FaceSwap:
        return <FaceSwap />;
      default:
        return <TextToImage />;
    }
  }, [activeFeature]);

  return (
    <div className="min-h-screen bg-dark-bg font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto pb-8">
        <header>
          <Header />
        </header>
        <Tabs activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        <main 
          className="mt-8 bg-dark-card rounded-xl p-6 sm:p-8 border border-dark-border"
          style={{boxShadow: '0 0 35px rgba(124, 58, 237, 0.15), 0 0 15px rgba(124, 58, 237, 0.1)'}}
        >
          {renderFeature()}
        </main>
      </div>
    </div>
  );
};

export default App;
