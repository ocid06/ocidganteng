import React from 'react';
import { Feature } from '../types';

interface TabsProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeFeature, setActiveFeature }) => {
  const features = Object.values(Feature);

  return (
    <div className="flex justify-center bg-dark-card border border-dark-border rounded-lg p-1.5 space-x-2 shadow-md">
      {features.map((feature) => (
        <button
          key={feature}
          onClick={() => setActiveFeature(feature)}
          className={`w-full px-3 py-2.5 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-purple focus-visible:ring-opacity-75
            ${activeFeature === feature
              ? 'bg-gradient-to-r from-brand-light-purple to-brand-purple text-white shadow-lg'
              : 'text-medium-text hover:bg-dark-border/50 hover:text-light-text'
            }
          `}
        >
          {feature}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
