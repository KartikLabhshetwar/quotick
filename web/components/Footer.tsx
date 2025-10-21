import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex items-center space-x-3">
            <img
              src="/icon.png"
              alt="Quotick Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Quotick</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                VS Code extension for smart quote conversion
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <a href="https://github.com/KartikLabhshetwar/quotick" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand transition-colors">
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} Quotick. Licensed under Apache 2.0
          </p>
        </div>
      </div>
    </footer>
  );
};
