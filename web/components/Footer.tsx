import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Logo and Description */}
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <img
              src="/icon.png"
              alt="Quotick Logo"
              width={40}
              height={40}
              className="rounded-lg sm:w-12 sm:h-12"
            />
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Quotick</span>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                VS Code extension for smart quote conversion
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-4 sm:space-x-6">
            <a href="https://github.com/KartikLabhshetwar/quotick" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-brand transition-colors">
              GitHub
            </a>
            <a href="https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-brand transition-colors">
              VS Code Marketplace
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} Quotick. Licensed under Apache 2.0
          </p>
        </div>
      </div>
    </footer>
  );
};
