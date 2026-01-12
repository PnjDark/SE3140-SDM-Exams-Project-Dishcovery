import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isOwner } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/restaurants', label: 'Restaurants'},
  ];

  const userLinks = isOwner
    ? [
        { path: '/dashboard/owner', label: 'Owner Dashboard'},
        { path: '/profile', label: 'Profile'},
      ]
    : [
        { path: '/dashboard', label: 'Dashboard'},
        { path: '/profile', label: 'Profile'},
      ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    // navigate('/');
    setShowUserMenu(false);
  };

    const handleLogin = () => {
    // Save current path for redirect after login
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      localStorage.setItem('redirectAfterLogin', location.pathname);
    }
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-text">Dishcovery</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} />
                  ) : (
                    <span className="avatar-placeholder">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* <span className="user-name">{user.name}</span>
                <span className="dropdown-arrow">▼</span> */}
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    {/* <div className="dropdown-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} />
                      ) : (
                        <span className="avatar-placeholder">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div> */}
                    <div className="dropdown-user-info">
                      <strong className="info-item">{user.name}</strong>
                      <small className="info-item">{user.email}</small>
                      <span className="user-role">
                        {isOwner ? 'Restaurant Owner' : 'Food Lover'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="dropdown-links">
                    {userLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="dropdown-link"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="dropdown-icon">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button onClick={handleLogout} className="dropdown-link logout">
                      <span className="dropdown-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={handleLogin} className="nav-link btn-login">
                {/* <span className="nav-icon">🔐</span> */}
                Sign In
              </button>
              <Link to="/register" className="nav-link btn-register">
                {/* <span className="nav-icon">📝</span> */}
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {userLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="mobile-nav-link logout">
                  <span className="nav-icon">🚪</span>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} className="mobile-nav-link">
                  <span className="nav-icon">🔐</span>
                  Sign In
                </button>
                <Link to="/register" className="mobile-nav-link btn-register">
                  <span className="nav-icon">📝</span>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;