"use client";
import React from 'react';
import { Navbar, NavBody, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, NavbarLogo, NavbarButton } from './ui/resizable-navbar';
import { GitHubStarButton } from './GitHubStarButton';

interface CustomNavbarProps {
  className?: string;
}

export const CustomNavbar: React.FC<CustomNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <Navbar className={className}>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <div className="flex items-center gap-3">
          <GitHubStarButton 
            owner="KartikLabhshetwar" 
            repo="quotick" 
            variant="default"
            className="text-sm"
          />
          <NavbarButton href="https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick" target='_blank' rel="noopener noreferrer" variant="dark">
            Install Extension
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col gap-3">
            <GitHubStarButton 
              owner="KartikLabhshetwar" 
              repo="quotick" 
              variant="default"
              className="text-sm"
            />
            <NavbarButton href="https://marketplace.visualstudio.com/items?itemName=kartiklabhshetwar.quotick" target='_blank' rel="noopener noreferrer" variant="dark">
              Install Extension
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
