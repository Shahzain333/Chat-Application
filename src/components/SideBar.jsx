import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { RiArrowDownSFill, RiBardLine, RiChatAiLine, RiFile4Line, RiFolderUserLine, 
    RiNotificationLine, RiShutDownLine, RiCloseLine, RiMenuLine } from "react-icons/ri";
import firebaseService from '../services/firebaseServices';
import { logout } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SideBar() {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Close mobile menu when screen size changes to medium or larger
    useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth >= 768) { // medium breakpoint
                setIsMobileMenuOpen(false)
            }
        }
        
        // Add event listener
        window.addEventListener('resize',handleResize)

        // For cleanup
        return () => window.addEventListener('resize', handleResize)

    }, [])

    const handleLogout = async () => {
        try {
            await firebaseService.signOut();
            dispatch(logout());
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { icon: RiChatAiLine, label: 'chat' },
        { icon: RiFolderUserLine, label: 'folder' },
        { icon: RiNotificationLine, label: 'notification' },
        { icon: RiFile4Line, label: 'file' },
        { icon: RiBardLine, label: 'bard' },
        { icon: RiShutDownLine, label: 'logout', onClick: handleLogout }
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenu(false);
    };

    return (
        <>
        {/* Mobile Header Bar - Only show on small screens */}
        <section className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between 
        h-16 bg-[#01AA85] px-4 z-50 shadow-lg">
            
            <div className="flex items-center gap-3">
                <img src={logo} className="w-10 h-10 object-contain bg-white rounded-lg p-1" 
                alt="Logo" />
            </div>

            <button onClick={toggleMobileMenu} className="text-4xl text-white ">
                {isMobileMenuOpen ? <RiCloseLine /> : <RiMenuLine />}
            </button>

        </section>

        {/* Sidebar - Desktop & Mobile */}
        <section className={`fixed md:static top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen
        w-full md:w-20 bg-[#01AA85] transform transition-transform duration-300 ease-in-out 
        z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-none`}>

            <main className="flex flex-col items-center gap-4 md:gap-8 h-full py-6 md:py-8">

                {/* Logo - Hidden on mobile, show on medium and up */}
                <div className="hidden md:flex justify-center border-b border-[#ffffffb9] w-full 
                pb-6 px-4">
                    <img src={logo} className="w-12 h-12 md:w-14 md:h-13 object-contain bg-white 
                    rounded-lg p-2" alt="Logo" />
                </div>

                {/* Navigation Menu */}
                <ul className="flex flex-col items-center gap-3 md:gap-8 w-full px-4 md:px-0">
                    
                    {menuItems.map((item, index) => (
                        
                        <li key={index} className="w-full">
                            
                            <button 
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    }
                                    closeMobileMenu();
                                }}
                                className="flex items-center justify-start md:justify-center gap-3 
                                w-full p-3 rounded-lg md:rounded-xl hover:bg-[#018f70]
                                transition-colors duration-200 group cursor-pointer"
                            >
                                <item.icon className="text-2xl md:text-[26px]" color="#fff" />
                                {/* Show labels only on small screens, hide on medium and up */}
                                <span className="md:hidden text-white font-medium capitalize text-lg">
                                    {item.label}
                                </span>

                            </button>
                        
                        </li>
                    
                    ))}
                
                </ul>

                {/* Mobile User Info - Only show on small screens */}
                <div className="md:hidden mt-auto px-4 py-4 border-t border-[#ffffffb9] w-full">
                    
                    <div className="flex items-center gap-3 text-white">
                        
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="font-semibold">U</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">User Name</p>
                            <p className="text-sm text-white text-opacity-80 truncate">user@example.com</p>
                        </div>
                    
                    </div>

                </div>

            </main>

        </section>

        {/* Spacer for mobile header - Only on small screens */}
        <div className="md:hidden h-16" />
        </>
    )
}

export default SideBar