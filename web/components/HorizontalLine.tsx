import React from 'react';

interface HorizontalLineProps {
  className?: string;
  color?: string;
  thickness?: number;
  opacity?: number;
  length?: 'full' | 'half' | 'quarter' | 'custom';
  customWidth?: string;
}

export const HorizontalLine: React.FC<HorizontalLineProps> = ({
  className = '',
  color = 'currentColor',
  thickness = 1,
  opacity = 0.1,
  length = 'full',
  customWidth = '100%',
}) => {
  const getWidth = () => {
    switch (length) {
      case 'half':
        return '50%';
      case 'quarter':
        return '25%';
      case 'custom':
        return customWidth;
      case 'full':
      default:
        return '100%';
    }
  };

  return (
    <div
      className={`flex justify-center items-center ${className}`}
      style={{ width: getWidth() }}
    >
      <div
        style={{
          width: getWidth(),
          height: `${thickness}px`,
          backgroundColor: color,
          opacity: opacity,
        }}
      />
    </div>
  );
};
