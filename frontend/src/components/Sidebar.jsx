import { useEffect, useState } from "react";

import {
  useNavigate,
  useLocation
} from "react-router";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [ticketCount, setTicketCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

const user = storedUser
  ? JSON.parse(storedUser)
  : null;

  useEffect(() => {
  const fetchTicketCount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setTicketCount(0);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load ticket count."
        );
      }

      const data = await response.json();

      setTicketCount(data.length);
    } catch (error) {
      console.error(
        "Sidebar ticket count error:",
        error
      );

      setTicketCount(0);
    }
  };

  fetchTicketCount();
}, [location.pathname]);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/", { replace: true });
};

const handleNavigate = (path) => {
  navigate(path);
  setIsMobileOpen(false);
};

  return (
  <>
    <button
      className="mobile-menu-button"
      onClick={() => setIsMobileOpen(true)}
      aria-label="Open navigation menu"
    >
      ☰
    </button>

    {isMobileOpen && (
      <div
        className="sidebar-overlay"
        onClick={() => setIsMobileOpen(false)}
      />
    )}

    <aside
      className={`sidebar ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >

      <button
        className="sidebar-close-button"
        onClick={() => setIsMobileOpen(false)}
        aria-label="Close navigation menu"
      >
        ×
      </button>

      <div className="sidebar-brand">
        <div className="sidebar-logo">H</div>

        <div>
          <h2>HelpDesk</h2>
          <span>IT Support</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <p className="menu-label">WORKSPACE</p>

        <button
  className={`sidebar-link ${
    location.pathname === "/dashboard" ? "active" : ""
  }`}
  onClick={() => handleNavigate("/dashboard")}
>
  <span className="sidebar-icon">▦</span>
  Dashboard
</button>

        <button
  className={`sidebar-link ${
    location.pathname === "/tickets" ? "active" : ""
  }`}
  onClick={() => handleNavigate("/tickets")}
>
  <span className="sidebar-icon">▤</span>
  Tickets
  <span className="menu-count">
  {ticketCount}
</span>
</button>

        {user?.role === "EMPLOYEE" && (
  <button
    className={`sidebar-link ${
      location.pathname === "/tickets/new"
        ? "active"
        : ""
    }`}
    onClick={() => handleNavigate("/tickets/new")}
  >
    <span className="sidebar-icon">＋</span>
    New Ticket
  </button>
)}

        {user?.role === "ADMIN" && (
  <>
    <p className="menu-label second-label">
      MANAGEMENT
    </p>

    <button
      className={`sidebar-link ${
        location.pathname === "/admin/users"
          ? "active"
          : ""
      }`}
      onClick={() =>
        handleNavigate("/admin/users")
      }
    >
      <span className="sidebar-icon">♙</span>
      User Management
    </button>
  </>
)}

<p className="menu-label second-label">
  RESOURCES
</p>

<button
  className={`sidebar-link ${
    location.pathname === "/knowledge-base"
      ? "active"
      : ""
  }`}
  onClick={() =>
    handleNavigate("/knowledge-base")
  }
>
  <span className="sidebar-icon">◇</span>
  Knowledge Base
</button>

      </nav>

      <div className="sidebar-bottom">

        <div className="sidebar-user">

          <div className="user-avatar">
  {user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"}
</div>

          <div className="user-info">
            <strong>
  {user?.name || "User"}
</strong>

<span>
  {user?.role
    ? user.role
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    : "Employee"}
</span>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

       </aside>
  </>
);
}

export default Sidebar;
