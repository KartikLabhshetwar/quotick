import React from 'react';
import { CustomNavbar } from './CustomNavbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection, CtaSection } from './AdditionalSections';
import { Footer } from './Footer';
import { HorizontalLine } from './HorizontalLine';

interface LandingPageProps {
  className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-background text-foreground relative pt-20 ${className}`}>
      {/* Left Vertical Line - positioned to match navbar content width */}
      <div className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10" 
           style={{ left: 'calc(50vw - 640px)' }}>
      </div>
      
      {/* Right Vertical Line - positioned to match navbar content width */}
      <div className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10" 
           style={{ right: 'calc(50vw - 640px)' }}>
      </div>
      
      {/* Navigation */}
      <CustomNavbar />
      
      {/* Hero Section */}
      <HeroSection 
        title="Automatically convert quotes to backticks"
        description="A VS Code extension that automatically converts quotes to backticks when typing template literals and reverts back when template syntax is removed. Smart quote conversion made simple."
      />

      <HorizontalLine />
      {/* Stats Section */}
      <StatsSection />
      
      <HorizontalLine />
      {/* Features Section */}
      <FeaturesSection />
      
      <HorizontalLine />
      {/* CTA Section */}
      <CtaSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
