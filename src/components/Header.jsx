import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../store/authSlice';
import { Button } from './ui/button';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-deep-green/10 bg-[#ffffff]">
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between max-w-[1440px] mx-auto">

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 text-emerald-600 group">
          <picture>
            <source srcSet="/Images/svglogo-64.webp" type="image/webp" />
            <img
              src="/Images/svglogo.svg"
              alt="Anvora Logo"
              width="52"
              height="52"
              className="size-13 object-contain group-hover:scale-110 transition-transform"
            />
          </picture>
        </Link>

        {/* Navigation - Main "Finder" Link */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link
              to="/colleges"
              className="flex items-center gap-2 text-sm font-extrabold text-emerald-600"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              University Finder
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="#" className="text-sm font-medium text-emerald-600">Guides</Link>
          </Button>
        </nav>

        {/* Action Buttons: Conditional Rendering */}
        <div className="flex items-center gap-3">
          {user ? (
            /* User is Logged In */
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-emerald-600 leading-none">{user.name}</p>
                <p className="text-xs text-emerald-600/60 mt-0.5">{user.email}</p>
              </div>

              {/* My Applications Link */}
              {(user.role === 'student' || user.role === 'user') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/applications"
                    className="flex items-center gap-2 text-emerald-600"
                    title="My Applications"
                  >
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                    <span className="text-sm font-bold hidden lg:block">Apps</span>
                  </Link>
                </Button>
              )}

              {/* Admin Link */}
              {user.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/admin/universities"
                    className="flex items-center gap-2 text-emerald-600"
                    title="Admin Dashboard"
                  >
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    <span className="text-sm font-bold hidden lg:block">Admin</span>
                  </Link>
                </Button>
              )}

              {/* Updated Profile Link with Icon */}
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/profile/update"
                  className="flex items-center gap-2 text-emerald-600"
                  title="Update Profile"
                >
                  <span className="material-symbols-outlined text-[20px]">person_edit</span>
                  <span className="text-sm font-bold hidden lg:block">Profile</span>
                </Link>
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </Button>
            </div>
          ) : (
            /* User is Logged Out */
            <>
              <Button variant="ghost" asChild>
                <Link
                  to="/login"
                  className="text-sm font-bold text-emerald-600"
                >
                  Login
                </Link>
              </Button>

              <Button variant="secondary" asChild className="hidden sm:flex">
                <Link to="/register">
                  Register Now
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;