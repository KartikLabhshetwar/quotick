import React from 'react';

interface VerticalLineProps {
  className?: string;
  color?: string;
  thickness?: number;
  opacity?: number;
  height?: 'full' | 'half' | 'quarter' | 'custom';
  customHeight?: string;
}

export const VerticalLine: React.FC<VerticalLineProps> = ({
  className = '',
  color = 'currentColor',
  thickness = 1,
  opacity = 0.1,
  height = 'full',
  customHeight = '100%',
}) => {
  const getHeight = () => {
    switch (height) {
      case 'half':
        return '50%';
      case 'quarter':
        return '25%';
      case 'custom':
        return customHeight;
      case 'full':
      default:
        return '100%';
    }
  };

  return (
    <div
      className={`flex justify-center items-center ${className}`}
      style={{ height: getHeight() }}
    >
      <div
        style={{
          width: `${thickness}px`,
          height: getHeight(),
          backgroundColor: color,
          opacity: opacity,
        }}
      />
    </div>
  );
};
