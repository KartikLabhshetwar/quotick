import React from 'react';
import { AnimatedShinyText } from './ui/animated-shiny-text';
import { TextAnimate } from './ui/text-animate';
import { LineShadowText } from './ui/line-shadow-text';

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
    <div className={`text-center relative ${className}`}>
      {tagline && (
        <AnimatedShinyText>
            {tagline}
        </AnimatedShinyText>
      )}
      
      <h1 className="text-center text-3xl font-medium tracking-normal text-black md:text-4xl lg:text-6xl dark:text-white mt-4">
        {title.split(' ').map((word, index) => {
          if (highlightText && word.toLowerCase() === highlightText.toLowerCase()) {
            return (
              <span key={index} className="relative inline-block">
                <TextAnimate
                  by="character"
                  animation="blurInUp"
                  delay={0.2 + (index * 0.1)}
                  duration={0.4}
                  className="inline text-brand"
                >
                  {word}
                </TextAnimate>
                <div className="absolute inset-0 pointer-events-none">
                  <LineShadowText
                    shadowColor="rgb(251 146 60)"
                    className="text-transparent"
                  >
                    {word}
                  </LineShadowText>
                </div>
              </span>
            );
          }
          return (
            <TextAnimate
              key={index}
              by="character"
              animation="blurInUp"
              delay={0.2 + (index * 0.1)}
              duration={0.4}
              className="inline"
            >
              {word}
            </TextAnimate>
          );
        }).reduce((prev: (React.ReactElement | string)[], curr, index) => {
          return index === 0 ? [curr] : [...prev, ' ', curr];
        }, [] as (React.ReactElement | string)[])}
      </h1>
      
      <h2 className="text-center text-sm font-medium tracking-tight text-gray-600 md:text-sm lg:text-base dark:text-gray-300 mx-auto mt-6 max-w-lg">
        {description}
      </h2>
    </div>
  );
};
