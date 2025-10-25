// Navigation component

import { Link, useNavigate } from 'react-router-dom';
import { User } from '../utils/types';
import { Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const publicLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/symptoms', label: 'Report Symptoms' },
    { to: '/pharmacy-finder', label: 'Find Pharmacy' },
    { to: '/blog', label: 'Health Blog' }
  ];

  const userLinks = [
    ...publicLinks,
    { to: '/profile', label: 'Profile' }
  ];

  const pharmacyLinks = [
    { to: '/pharmacy/dashboard', label: 'Dashboard' },
    { to: '/pharmacy/inventory', label: 'Inventory' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/data', label: 'Data Management' },
    { to: '/admin/import', label: 'Import Data' },
    { to: '/admin/blog', label: 'Manage Blog' },
    { to: '/admin/pharmacies', label: 'Manage Pharmacies' }
  ];

  let links = publicLinks;
  if (user) {
    if (user.role === 'admin') {
      links = adminLinks;
    } else if (user.role === 'pharmacy') {
      links = pharmacyLinks;
    } else {
      links = userLinks;
    }
  }

  return (
    <nav className="bg-black text-white border-b-2 border-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <span className="font-bold">Ghana Health Alert</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white">
                <span className="text-sm">
                  {user.username} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 hover:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="py-2 text-sm border-t border-white mt-2 pt-2">
                  {user.username} ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block mt-2 px-4 py-2 bg-white text-black text-center hover:bg-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
