import { Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { get } = useSettings();
  return (
    <footer className="bg-blue-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-blue-800 pb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link className="flex items-center gap-2 bg-white inline-flex p-2 rounded" to="/">
              <img src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781785543/gyaanpath-logo_j41gsq.png" alt="GyaanPath Digital" className="h-8 w-auto px-2" />
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed">{get('footer_tagline')}</p>
            <div className="flex space-x-4">
              <a className="w-8 h-8 bg-blue-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors" href="#">
                <Facebook size={16} />
              </a>
              <a className="w-8 h-8 bg-blue-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors" href="#">
                <Instagram size={16} />
              </a>
              <a className="w-8 h-8 bg-blue-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors" href="#">
                <Youtube size={16} />
              </a>
              <a className="w-8 h-8 bg-blue-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors" href="#">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/">Home</Link></li>
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/about">About Us</Link></li>
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          {/* Important Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Important Links</h4>
            <ul className="space-y-3">
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/refund-policy">Refund Policy</Link></li>
              <li><Link className="text-blue-200 hover:text-white transition-colors text-sm" to="/career">Career</Link></li>
              <li><a className="text-blue-200 hover:text-white transition-colors text-sm" href="/admin">Admin</a></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-blue-200">
                <Phone className="mt-1 mr-3 text-orange-500 flex-shrink-0" size={16} />
                <a href={`tel:${get('contact_phone_raw')}`} className="hover:text-white transition-colors">{get('contact_phone')}</a>
              </li>
              <li className="flex items-start text-sm text-blue-200">
                <Mail className="mt-1 mr-3 text-orange-500 flex-shrink-0" size={16} />
                <a href={`mailto:${get('contact_email')}`} className="hover:text-white transition-colors break-all">{get('contact_email')}</a>
              </li>
              <li className="flex items-start text-sm text-blue-200">
                <MapPin className="mt-1 mr-3 text-orange-500" size={16} />
                {get('contact_address')}
              </li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
          <p>© 2026 GyaanPath Digital. All Rights Reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center">
            Designed with <Heart className="text-red-500 mx-1" size={12} fill="currentColor" /> for a Better India
          </p>
        </div>
      </div>
    </footer>
  );
}
