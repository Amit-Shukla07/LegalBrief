import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ScaleIcon,
  DashboardIcon,
  ClientsIcon,
  CasesIcon,
  DocumentsIcon,
  HearingsIcon,
  TimelineIcon,
  AdminRequestsIcon,
  LogOutIcon,
  MenuIcon,
} from "./Icons";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/clients", label: "Clients", icon: ClientsIcon },
  { to: "/cases", label: "Cases", icon: CasesIcon },
  { to: "/documents", label: "Documents", icon: DocumentsIcon },
  { to: "/hearings", label: "Hearings", icon: HearingsIcon },
  { to: "/timeline", label: "Timeline", icon: TimelineIcon },
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/cases": "Cases",
  "/documents": "Documents",
  "/hearings": "Hearings",
  "/timeline": "Timeline",
  "/admin-requests": "Admin Requests",
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(41, 32, 27, 0.4)",
            zIndex: 35,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Clean Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <ScaleIcon size={18} />
          </div>
          <span className="sidebar-brand-name">LegalBrief</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">
                  <Icon size={17} />
                </span>
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {user?.role === "Admin" && (
            <NavLink
              to="/admin-requests"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">
                <AdminRequestsIcon size={17} />
              </span>
              <span>Admin Requests</span>
              <span className="nav-admin-badge">Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-text">
              <span className="user-name" title={user?.name}>
                {user?.name || "User"}
              </span>
              <span className="user-role">{user?.role || "Staff"}</span>
            </div>
          </div>
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <header className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              <MenuIcon size={18} />
            </button>
            <div className="breadcrumbs">
              <span>LegalBrief</span>
              <span>/</span>
              <span className="crumb-current">{currentTitle}</span>
            </div>
          </div>
          <span className="top-bar-date">{formattedDate}</span>
        </header>

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
