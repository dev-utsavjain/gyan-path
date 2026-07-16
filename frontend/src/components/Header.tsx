import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Phone, Menu, X } from 'lucide-react';
import GlareHover from './GlareHover';

interface HeaderProps {
  onEnroll?: () => void;
}

export default function Header({ onEnroll }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getNavClass = (path: string) => {
    return location.pathname === path
      ? "text-orange-500 font-semibold border-b-2 border-orange-500 pb-1 cursor-target"
      : "text-gray-600 hover:text-blue-800 font-medium transition-colors cursor-target";
  };
  const getMobileNavClass = (path: string) => {
    return location.pathname === path
      ? "text-orange-500 font-semibold"
      : "text-gray-600 hover:text-blue-800 font-medium transition-colors";
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-50 bg-white">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link className="flex items-center gap-2" to="/">
            <img src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781785543/gyaanpath-logo_j41gsq.png" alt="GyaanPath Digital" className="h-7 w-auto" />
          </Link>
        </div>
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link className={getNavClass('/')} to="/">Home</Link>
          <Link className={getNavClass('/about')} to="/about">About Us</Link>
          <Link className={getNavClass('/career')} to="/career">Career</Link>
          <Link className={getNavClass('/contact')} to="/contact">Contact Us</Link>
        </nav>
        {/* CTA */}
        <div className="hidden lg:flex items-center space-x-6">
          <a href="tel:+917974889250" className="flex items-center text-blue-900 font-semibold hover:text-orange-500 transition-colors">
            <Phone size={18} className="mr-2" />
            +91 7974889250
          </a>
          <button onClick={onEnroll} className="bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-colors cursor-target overflow-hidden block">
            <GlareHover className="px-6 py-2 flex items-center justify-center w-full h-full" glareSize={150}>
              Enroll Now
            </GlareHover>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full flex flex-col space-y-4 px-4 py-6 border-t border-gray-100 z-40">
          <Link className={getMobileNavClass('/')} to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link className={getMobileNavClass('/about')} to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link className={getMobileNavClass('/career')} to="/career" onClick={() => setIsMobileMenuOpen(false)}>Career</Link>
          <Link className={getMobileNavClass('/contact')} to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
          
          <a href="tel:+917974889250" className="flex items-center text-blue-900 font-semibold pt-4 border-t border-gray-100 hover:text-orange-500 transition-colors">
            <Phone size={18} className="mr-2" />
            +91 7974889250
          </a>
          <button onClick={() => { setIsMobileMenuOpen(false); onEnroll?.(); }} className="bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-colors cursor-target overflow-hidden block w-full mt-2">
            <div className="px-6 py-3 flex items-center justify-center w-full h-full">
              Enroll Now
            </div>
          </button>
        </div>
      )}
    </header>
  );
}
