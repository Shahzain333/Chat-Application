import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../store/authSlice';
import firebaseService from '../../services/firebaseServices';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await firebaseService.signOut();
      dispatch(logout());
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {
            user ? (
              <NavLink to={'/dashboard'}>
                <div className="text-2xl font-bold text-green-600">Chat App</div>
              </NavLink>
            ) : (
              <NavLink to={'/'}>
                <div className="text-2xl font-bold text-green-600">Chat App</div>
              </NavLink>
            )
          }
          

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-700">
                  Welcome, {user.displayName || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg 
                  transition duration-300 cursor-pointer font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink to={'/login'}>
                <button className="bg-green-600 hover:bg-green-700 
                text-white px-4 py-2 rounded-lg transition duration-300 cursor-pointer font-semibold">
                  Login
                </button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden cursor-pointer"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
          <nav className="flex flex-col space-y-3">
            {user ? (
              <>
                <div className="px-2 py-2 text-green-600 border-b border-green-200">
                  Welcome, {user.displayName || user.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to={'/login'} onClick={() => setIsMobileMenuOpen(false)}>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300 w-full text-left">
                  Login
                </button>
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;