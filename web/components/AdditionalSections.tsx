import React from 'react';
import { Ripple } from './ui/ripple';
import { TextAnimate } from './ui/text-animate';

interface StatsSectionProps {
  className?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ className = '' }) => {
  const stats = [
    { number: "10M+", label: "Workflows Executed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "500+", label: "Enterprise Clients" },
    { number: "50ms", label: "Average Response Time" },
  ];

  return (
    <div className={`py-20 lg:py-32 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4">
            <TextAnimate
              by="word"
              animation="slideUp"
              delay={0.1}
              duration={0.6}
              className="inline"
            >
              Trusted by Industry Leaders
            </TextAnimate>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            <TextAnimate
              by="word"
              animation="fadeIn"
              delay={0.4}
              duration={0.8}
              className="inline"
            >
              Join thousands of companies already using our platform to automate their workflows and boost productivity.
            </TextAnimate>
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
                <TextAnimate
                  by="character"
                  animation="scaleUp"
                  delay={0.6 + (index * 0.1)}
                  duration={0.5}
                  className="inline"
                >
                  {stat.number}
                </TextAnimate>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <TextAnimate
                  by="word"
                  animation="fadeIn"
                  delay={0.8 + (index * 0.1)}
                  duration={0.4}
                  className="inline"
                >
                  {stat.label}
                </TextAnimate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CtaSectionProps {
  className?: string;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ className = '' }) => {
  return (
    <div className={`py-12 md:py-20 lg:py-32 relative overflow-hidden ${className}`}>
      {/* Ripple Effect Background */}
      <Ripple 
        mainCircleSize={150}
        mainCircleOpacity={0.15}
        numCircles={6}
        className="opacity-100"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 sm:mb-6 leading-tight">
            <TextAnimate
              by="word"
              animation="blurInUp"
              delay={0.1}
              duration={0.8}
              className="inline"
            >
              Ready to convert quotes to backticks?
            </TextAnimate>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            <TextAnimate
              by="word"
              animation="fadeIn"
              delay={0.5}
              duration={0.6}
              className="inline"
            >
              Install the extension to start converting quotes to backticks.
            </TextAnimate>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <a href="https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick" 
               target="_blank"
               rel="noopener noreferrer"
               className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors text-center text-sm sm:text-base">
              Install Extension
            </a>
        </div>
      </div>
    </div>
  );
};
