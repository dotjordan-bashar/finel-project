import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: "bi-speedometer2", end: true },
  { to: "/admin/users", label: "Users", icon: "bi-people" },
  { to: "/admin/cars", label: "Cars", icon: "bi-car-front" },
  { to: "/admin/bookings", label: "Bookings", icon: "bi-calendar-check" },
];

// Sidebar on desktop, horizontal tabs on mobile; the admin pages render inside <Outlet />
export default function AdminLayout() {
  return (
    <div className="container-fluid py-4 px-lg-4">
      <div className="row g-4">
        <aside className="col-lg-2">
          <nav className="nav nav-pills flex-row flex-lg-column gap-1 admin-sidebar overflow-auto flex-nowrap">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className="nav-link text-nowrap">
                <i className={`bi ${link.icon} me-2`} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="col-lg-10">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
