import React, { ReactNode } from 'react';
import logo from '../../public/SnaplogicLogo.png';

type LogoProps = {
    children?: ReactNode; // Using ReactNode to type the children prop
};

export const Logo: React.FC<LogoProps> = ({ children }) => {
    return (
        <div className="sticky top-0 z-40 flex justify-center items-center h-12 bg-white dark:bg-[#4A5273] shadow-md">
            <img src={logo.src} alt="Logo" className="object-contain transform scale-50" />
            {children}
        </div>
    );
};
Logo.displayName = 'Logo';
