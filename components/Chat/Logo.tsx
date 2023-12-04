import React, { ReactNode } from 'react';
import logo from '../../public/Logo.png';

type LogoProps = {
    children?: ReactNode; // Using ReactNode to type the children prop
};

export const Logo: React.FC<LogoProps> = ({ children }) => {
    const CONSTANTS = require('../../constants.config');
    
    const logoText = CONSTANTS.logoText ? CONSTANTS.logoText : "";
    return (
        <div className="sticky top-0 z-40 flex justify-center items-center h-12 bg-white shadow-md">
            {/* <img src={logo.src} alt="Logo" className="h-full object-contain transform" /> */}
            <p className="text-primary text-2xl">{logoText}</p>
            {children}
        </div>
    );
};
Logo.displayName = 'Logo';
