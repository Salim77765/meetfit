import { useState } from 'react';
import './MobileMenu.css';

const MobileMenu = ({ isAuthenticated, handleLogout, toggleChatbot }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="mobile-menu-container">
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li><a href="/" onClick={closeMenu}>Home</a></li>
            {isAuthenticated ? (
              <>
                <li><a href="/activities" onClick={closeMenu}>Activities</a></li>
                <li><a href="/my-activities" onClick={closeMenu}>My Activities</a></li>
                <li><a href="/profile" onClick={closeMenu}>Profile</a></li>
                <li>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    toggleChatbot();
                  }} className="chatbot-nav-icon">💬 Assistant</a>
                </li>
                <li>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    handleLogout();
                  }}>Logout</a>
                </li>
              </>
            ) : (
              <>
                <li><a href="/login" onClick={closeMenu}>Login</a></li>
                <li><a href="/register" onClick={closeMenu}>Register</a></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;