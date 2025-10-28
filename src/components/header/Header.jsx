import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-900 text-white">
      
      <div className="container mx-auto px-4 py-4">

        {/* Main header content */}
        <div className="flex justify-between items-center">
      
          <div className="flex items-center space-x-8">
            <NavLink to={'/'}>
              <div className="text-2xl font-bold">Chat App</div>
            </NavLink>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            <NavLink to={'/login'}>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-300 cursor-pointer">
                Login
              </button>
            </NavLink>

          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white cursor-pointer"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-2 `}>
          <nav className="flex flex-col space-y-4">
            
            <div className="flex flex-col space-y-3 pt-2 border-t border-gray-700">

              <NavLink to={'/login'}>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg 
                  transition duration-300 cursor-pointer w-full">
                  Login
                </button>
              </NavLink>
            
            </div>
          
          </nav>
        
        </div>
      
      </div>
    
    </header>
  );
};

export default Header;