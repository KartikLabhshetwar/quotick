import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  href?: string;
  onClick?: () => void;
  className?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  target,
  rel,
}) => {
  const baseClasses = 'block rounded-xl px-6 py-2 text-center text-sm font-medium transition duration-150 active:scale-[0.98] sm:text-base';
  
  const variantClasses = {
    primary: 'bg-brand text-white hover:bg-brand/90 dark:bg-brand dark:text-white',
    secondary: 'border-divide border bg-white text-black hover:bg-gray-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
};
