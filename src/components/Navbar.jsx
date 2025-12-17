import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const renderLinks = () => {
    if (user.role === "user") {
      return (
        <>
          <Link
            to="/dashboard"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive("/dashboard")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/subjects"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive("/subjects")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Subjects
          </Link>
          <Link
            to="/results"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive("/results")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Results
          </Link>
          <Link
            to="/profile"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive("/profile")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link
            to="/admin"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive("/admin")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/subjects"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname.startsWith("/admin/subjects")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Subjects
          </Link>
          <Link
            to="/admin/tests"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname.startsWith("/admin/tests")
                ? "bg-indigo-700 text-white"
                : "hover:bg-indigo-500 text-indigo-100"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Tests
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-indigo-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={user.role === "admin" ? "/admin" : "/dashboard"}
            className="text-xl font-bold tracking-tight hover:text-indigo-100 transition-colors"
          >
            📚 Exam Assistant
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {user.role === "user" && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/subjects"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/subjects")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Subjects
                </Link>
                <Link
                  to="/results"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/results")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Results
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/profile")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/subjects"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname.startsWith("/admin/subjects")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Subjects
                </Link>
                <Link
                  to="/admin/tests"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname.startsWith("/admin/tests")
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-500 text-indigo-100"
                  }`}
                >
                  Tests
                </Link>
              </>
            )}
            <span className="text-sm text-indigo-100">{user.email}</span>
            <span className="px-3 py-1 bg-indigo-500 rounded-full text-xs font-semibold uppercase">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-600 px-4 pt-4 pb-6 space-y-3">
          {renderLinks()}

          <div className="flex justify-between items-center">
            <div className=" px-2 ">
              <span className="px-3 py-1 bg-indigo-500 rounded-full text-xs font-semibold uppercase">
                {user.role}
              </span>
              <span className="block text-sm text-indigo-100 pt-2">
                {user.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 mt-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
