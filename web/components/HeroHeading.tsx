import React from 'react';
import { AnimatedShinyText } from './ui/animated-shiny-text';

interface HeroHeadingProps {
  tagline?: string;
  title: string;
  highlightText?: string;
  description: string;
  className?: string;
}

export const HeroHeading: React.FC<HeroHeadingProps> = ({
  tagline,
  title,
  highlightText,
  description,
  className = '',
}) => {
  return (
    <div className={`text-center ${className}`}>
      {tagline && (
        <AnimatedShinyText>
            {tagline}
        </AnimatedShinyText>
      )}
      
      <h1 className="text-center text-3xl font-medium tracking-normal text-black md:text-4xl lg:text-6xl dark:text-white mt-4">
        {title.split(' ').map((word, index) => {
          if (highlightText && word.toLowerCase() === highlightText.toLowerCase()) {
            return (
              <span key={index} className="text-brand">
                {word}{' '}
              </span>
            );
          }
          return word + ' ';
        })}
      </h1>
      
      <h2 className="text-center text-sm font-medium tracking-tight text-gray-600 md:text-sm lg:text-base dark:text-gray-300 mx-auto mt-6 max-w-lg">
        {description}
      </h2>
    </div>
  );
};
