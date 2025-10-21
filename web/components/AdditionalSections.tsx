import React from 'react';

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
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of companies already using our platform to automate their workflows and boost productivity.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                {stat.label}
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
    <div className={`py-20 lg:py-32 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-6">
          Ready to convert quotes to backticks?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Install the extension to start converting quotes to backticks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick" 
             target="_blank"
             rel="noopener noreferrer"
             className="px-8 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors text-center">
            Install Extension
          </a>
        </div>
      </div>
    </div>
  );
};
