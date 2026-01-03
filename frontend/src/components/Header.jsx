import React, { useState } from 'react';
import { Menu, User, Globe, Chrome, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <div className="text-2xl font-bold">Uber</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-gray-300 transition-colors">Ride</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Drive</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Business</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Uber Eats</a>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-gray-300 transition-colors flex items-center">
              About
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black">
              <DropdownMenuItem>How Uber works</DropdownMenuItem>
              <DropdownMenuItem>Newsroom</DropdownMenuItem>
              <DropdownMenuItem>Investor relations</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="hidden md:flex text-white hover:bg-gray-800">
          <Globe className="w-4 h-4 mr-2" />
          EN
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <User className="w-4 h-4 mr-2" />
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              Help
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              Log in
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-black hover:bg-gray-100">
              Sign up
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800" onClick={() => alert('Google Login')}>
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800" onClick={() => alert('Facebook Login')}>
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm" 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-800 md:hidden">
          <nav className="px-6 py-4 space-y-4">
            <a href="#" className="block hover:text-gray-300 transition-colors">Ride</a>
            <a href="#" className="block hover:text-gray-300 transition-colors">Drive</a>
            <a href="#" className="block hover:text-gray-300 transition-colors">Business</a>
            <a href="#" className="block hover:text-gray-300 transition-colors">Uber Eats</a>
            <a href="#" className="block hover:text-gray-300 transition-colors">About</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;