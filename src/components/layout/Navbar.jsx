import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from '../ui/resizable-navbar';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'About', link: '/about' },
    { name: 'Therapists', link: '/therapists' },
    { name: 'Contact', link: '/contact' },
  ];

  const handleMobileNavItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <ResizableNavbar className="py-2">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo logoText="CareNest" href="/" />
        
        <NavItems items={navItems} />

        <div className="flex items-center gap-3 relative z-30">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#9ECAD6] flex items-center justify-center text-white font-medium">
                  {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <span>{user.fullName || user.email}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-[#748DAE] font-medium mt-1 capitalize">{user.role}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/my-feedback"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    My Feedback
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavbarButton
                as={Link}
                to="/login"
                variant="secondary"
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </NavbarButton>
              <NavbarButton
                as={Link}
                to="/register"
                variant="primary"
              >
                Get Started
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo logoText="CareNest" href="/" />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="text-gray-700 hover:text-gray-900 transition font-medium"
              onClick={handleMobileNavItemClick}
            >
              {item.name}
            </Link>
          ))}

          {isAuthenticated && user ? (
            <>
              <div className="px-4 py-2 bg-gray-50 rounded-md w-full">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-[#748DAE] font-medium mt-1 capitalize">{user.role}</p>
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium"
                onClick={handleMobileNavItemClick}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/my-feedback"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium"
                onClick={handleMobileNavItemClick}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                My Feedback
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-left text-red-600 hover:text-red-700 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 w-full pt-2">
              <NavbarButton
                as={Link}
                to="/login"
                variant="secondary"
                className="w-full"
                onClick={handleMobileNavItemClick}
              >
                Login
              </NavbarButton>
              <NavbarButton
                as={Link}
                to="/register"
                variant="primary"
                className="w-full"
                onClick={handleMobileNavItemClick}
              >
                Get Started
              </NavbarButton>
            </div>
          )}
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
};