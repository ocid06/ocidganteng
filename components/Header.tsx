import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 flex flex-col items-center">
      <Logo />
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light-purple to-brand-purple">
        Hasilkan Gambar Bareng Ocid
      </h1>
      <p className="mt-3 text-base sm:text-lg text-medium-text max-w-xl">
        OCID AI yang cerdas dan keche, dengan ai buatan orang ganteng
      </p>
    </header>
  );
};

export default Header;