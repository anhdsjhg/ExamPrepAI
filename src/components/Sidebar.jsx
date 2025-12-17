import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const userLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/subjects", label: "Subjects" },
    { path: "/results", label: "Results" },
    { path: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/subjects", label: "Subjects" },
    { path: "/admin/tests", label: "Tests" },
  ];

  const links = user.role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive(link.path)
                ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;





