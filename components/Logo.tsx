import React, { useEffect } from 'react';

const Logo: React.FC = () => {
  useEffect(() => {
    const styleId = 'ocid-logo-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes aurora {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(167, 139, 250, 0); }
        100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
      }
      .logo-aurora {
        background: linear-gradient(-45deg, #a78bfa, #7c3aed, #a78bfa, #7c3aed);
        background-size: 400% 400%;
        animation: aurora 8s ease infinite;
      }
      .logo-pulse {
         animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="flex items-center justify-center w-20 h-20 rounded-full logo-pulse mb-4">
      <div className="flex items-center justify-center w-full h-full bg-dark-bg rounded-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full logo-aurora">
          <div className="w-8 h-8 bg-dark-bg rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
