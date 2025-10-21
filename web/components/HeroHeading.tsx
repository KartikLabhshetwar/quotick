import React from 'react';

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
        <p 
          className="relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent [background-repeat:no-repeat,padding-box] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] text-sm font-normal [--base-color:var(--color-brand)] [--base-gradient-color:var(--color-white)] dark:[--base-color:var(--color-brand)] dark:[--base-gradient-color:var(--color-white)]"
          style={{
            '--spread': '68px',
            backgroundImage: 'var(--bg), linear-gradient(var(--base-color), var(--base-color))',
            backgroundPosition: '21.5% center'
          } as React.CSSProperties}
        >
          {tagline}
        </p>
      )}
      
      <h1 className="text-center text-3xl font-medium tracking-tight text-black md:text-4xl lg:text-6xl dark:text-white mt-4">
        {title.split(' ').map((word, index) => {
          if (highlightText && word.toLowerCase() === highlightText.toLowerCase()) {
            return (
              <span key={index} className="text-brand">
                {word}
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
