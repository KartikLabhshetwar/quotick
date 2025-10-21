import React from 'react';

interface VideoDemoProps {
  src: string;
  title?: string;
  description?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const VideoDemo: React.FC<VideoDemoProps> = ({
  src,
  title = "See Quotick in Action",
  description = "Watch how Quotick automatically converts quotes to backticks as you type",
  className = '',
  width = 800,
  height = 450,
}) => {
  return (
    <div className={`py-12 md:py-16 lg:py-20 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 sm:mb-6">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            src={src}
            width={width}
            height={height}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-w-full"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};
