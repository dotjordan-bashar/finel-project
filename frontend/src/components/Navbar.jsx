import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Controls the mobile menu (the "hamburger" button)
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={closeMenu}>
          <i className="bi bi-car-front-fill text-primary me-2" />
          DriveJo
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/cars" onClick={closeMenu}>
                Browse cars
              </NavLink>
            </li>

            {user?.role === "customer" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-bookings" onClick={closeMenu}>
                  My bookings
                </NavLink>
              </li>
            )}

            {user?.role === "owner" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/cars" onClick={closeMenu}>
                    My cars
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/bookings" onClick={closeMenu}>
                    Booking requests
                  </NavLink>
                </li>
              </>
            )}

            {user?.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin" onClick={closeMenu}>
                  Admin panel
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-lg-center gap-lg-2">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile" onClick={closeMenu}>
                    <i className="bi bi-person-circle me-1" />
                    {user.name}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm my-2 my-lg-0" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={closeMenu}>
                    Log in
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm my-2 my-lg-0" to="/register" onClick={closeMenu}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
