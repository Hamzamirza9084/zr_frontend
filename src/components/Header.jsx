import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Check for user in localStorage whenever the route changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-deep-green/10 bg-[#ffffff]">
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between max-w-[1440px] mx-auto">

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 text-emerald-600 group">
          <img
            src="/Images/svglogo.svg"
            alt="Anvora Logo"
            className="size-13 object-contain group-hover:scale-110 transition-transform"
          />
        </Link>

        {/* Navigation - Main "Finder" Link */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/colleges"
            className="flex items-center gap-2 text-sm font-extrabold text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            University Finder
          </Link>
          <Link to="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">Guides</Link>
        </nav>

        {/* Action Buttons: Conditional Rendering */}
        <div className="flex items-center gap-4">
          {user ? (
            /* User is Logged In */
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-emerald-600 leading-none">{user.name}</p>
                <p className="text-xs text-emerald-600/60 mt-0.5">{user.email}</p>
              </div>

              {/* My Applications Link */}
              {(user.role === 'student' || user.role === 'user') && (
                <Link
                  to="/applications"
                  className="flex items-center gap-2 bg-emerald-600/5 hover:bg-emerald-600/10 text-emerald-600 px-3 py-2 rounded-lg transition-all"
                  title="My Applications"
                >
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                  <span className="text-sm font-bold hidden lg:block">Apps</span>
                </Link>
              )}

              {/* Admin Link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin/universities"
                  className="flex items-center gap-2 bg-emerald-600/5 hover:bg-emerald-600/10 text-emerald-600 px-3 py-2 rounded-lg transition-all"
                  title="Admin Dashboard"
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span className="text-sm font-bold hidden lg:block">Admin</span>
                </Link>
              )}

              {/* Updated Profile Link with Icon */}
              <Link
                to="/profile/update"
                className="flex items-center gap-2 bg-emerald-600/5 hover:bg-emerald-600/10 text-emerald-600 px-3 py-2 rounded-lg transition-all"
                title="Update Profile"
              >
                <span className="material-symbols-outlined text-[20px]">person_edit</span>
                <span className="text-sm font-bold hidden lg:block">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center size-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            /* User is Logged Out */
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="hidden sm:flex items-center justify-center rounded-lg h-10 px-6 bg-[#0F4C3A] text-white text-sm font-bold border border-[#0F4C3A] shadow-[3px_3px_0px_0px_rgba(15,76,58,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,76,58,1)] transition-all"
              >
                Register Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;