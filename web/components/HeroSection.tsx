import React from 'react';
import { HeroHeading } from './HeroHeading';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import Link from 'next/link';

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
  title = "Automatically convert quotes to backticks",
  highlightText = "backticks",
  description = "A VS Code extension that automatically converts quotes to backticks when typing template literals and reverts back when template syntax is removed. Smart quote conversion made simple.",
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
        <Button variant="primary" href={primaryButtonHref}>
          <Link href={primaryButtonHref} target="_blank" rel="noopener noreferrer">
            {primaryButtonText}
          </Link>
        </Button>
      </div>
      
      <Badge
        rating={badgeRating}
        text={badgeText}
      />
    </div>
  );
};
