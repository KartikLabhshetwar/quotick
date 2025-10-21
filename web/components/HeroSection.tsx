"use client"
import React from 'react';
import { HeroHeading } from './HeroHeading';
import { Button } from './ui/Button';
import { DotPattern } from './ui/dot-pattern';

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
  highlightText = "retype",
  description = "Instantly converts quotes to backticks as you type. No more retyping template literals.",
  primaryButtonText = "Install Extension",
  primaryButtonHref = "https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick",
  badgeText = "Trusted by developers worldwide",
  badgeRating = 0,
  className = '',
}) => {
  return (
    <div className={`min-h-[calc(100vh-10rem)] w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-10 md:pt-32 md:pb-20 relative overflow-hidden ${className}`}>
      {/* Amber Glow Background */}
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #f59e0b 100%)
          `,
          backgroundSize: "100% 100%",
        }}
      />
      
      {/* Dot Pattern Background */}
      <DotPattern 
        width={20}
        height={20}
        glow={true}
        className="opacity-100"
      />
      
      <div className="relative z-10">
        <HeroHeading
          tagline={tagline}
          title={title}
          highlightText={highlightText}
          description={description}
        />
        
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="primary" href={primaryButtonHref} target="_blank" rel="noopener noreferrer">
            {primaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
