"use client"

import React from 'react';
import { TextAnimate } from './ui/text-animate';
import { motion } from 'motion/react';

interface HowToUseProps {
  className?: string;
}

export const HowToUse: React.FC<HowToUseProps> = ({ className = '' }) => {
  const steps = [
    {
      number: "01",
      title: "Click Install Extension",
      description: "Click the 'Install Extension' button to go to the VS Code Marketplace"
    },
    {
      number: "02", 
      title: "Download & Install",
      description: "Download and install the extension directly in your VS Code editor"
    },
    {
      number: "03",
      title: "Start Coding",
      description: "Boom! Now you can use this extension. Just start typing template literals and watch the magic happen"
    }
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.4
      }
    }
  };

  // Animation variants for each step
  const stepVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1
    }
  };

  return (
    <div className={`py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-6">
            <TextAnimate
              by="word"
              animation="slideUp"
              delay={0.1}
              duration={0.6}
              className="inline"
            >
              How to Use Quotick
            </TextAnimate>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            <TextAnimate
              by="word"
              animation="fadeIn"
              delay={0.4}
              duration={0.8}
              className="inline"
            >
              Get started with Quotick in just three simple steps. No complex setup required!
            </TextAnimate>
          </p>
        </div>

        {/* Steps */}
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-6 group"
                variants={stepVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-brand text-white rounded-full text-xl font-bold group-hover:bg-brand/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step.number}
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold text-black dark:text-white mb-3">
                    <TextAnimate
                      by="word"
                      animation="blurInUp"
                      delay={0.6 + (index * 0.2)}
                      duration={0.5}
                      className="inline"
                    >
                      {step.title}
                    </TextAnimate>
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    <TextAnimate
                      by="word"
                      animation="fadeIn"
                      delay={0.8 + (index * 0.2)}
                      duration={0.6}
                      className="inline"
                    >
                      {step.description}
                    </TextAnimate>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
