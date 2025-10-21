import React from 'react';
import { HeroHeading } from './HeroHeading';
import { Button } from './ui/Button';

interface HeroSectionProps {
  tagline?: string;
  title: string;
  highlightText?: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  badgeText?: string;
  badgeRating?: number;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  tagline = "For fast moving developers.",
  title = "Never retype quotes again",
  highlightText = "",
  description = "Instantly converts quotes to backticks as you type. No more retyping template literals.",
  primaryButtonText = "Install Extension",
  primaryButtonHref = "https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick",
  badgeText = "Trusted by developers worldwide",
  badgeRating = 0,
  className = '',
}) => {
  return (
    <div className={`max-w-7xl mx-auto flex flex-col items-center justify-center px-4 pt-10 pb-10 md:pt-32 md:pb-20 ${className}`}>
      <HeroHeading
        tagline={tagline}
        title={title}
        highlightText={highlightText}
        description={description}
      />
      
      <div className="mt-6 flex items-center gap-4">
        <Button variant="primary" href={primaryButtonHref} target="_blank" rel="noopener noreferrer">
          {primaryButtonText}
        </Button>
      </div>
      
    </div>
  );
};
