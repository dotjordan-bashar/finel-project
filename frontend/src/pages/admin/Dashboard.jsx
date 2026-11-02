import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatPrice } from "../../utils/helpers";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <AlertMessage message={error} />;
  if (!stats) return <Loader />;

  const cards = [
    { label: "Users", value: stats.users.total, note: `${stats.users.customers} customers · ${stats.users.owners} owners`, icon: "bi-people", color: "primary", link: "/admin/users" },
    { label: "Cars", value: stats.cars.total, note: `${stats.cars.pending} waiting for review`, icon: "bi-car-front", color: "info", link: "/admin/cars?status=pending" },
    { label: "Bookings", value: stats.bookings.total, note: `${stats.bookings.pending} pending`, icon: "bi-calendar-check", color: "warning", link: "/admin/bookings" },
    { label: "Revenue", value: formatPrice(stats.revenue), note: "Confirmed + completed", icon: "bi-cash-stack", color: "success" },
  ];

  return (
    <>
      <h1 className="h3 mb-4">Dashboard</h1>

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <div className="card border-0 shadow-sm h-100 stat-card">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <div className="fs-3 fw-bold">{card.value}</div>
                  {card.link ? (
                    <Link to={card.link} className="small">{card.note}</Link>
                  ) : (
                    <span className="small text-muted">{card.note}</span>
                  )}
                </div>
                <i className={`bi ${card.icon} text-${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold">Recent bookings</div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>Car</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.customer?.name || "Deleted user"}</td>
                  <td>{b.car ? `${b.car.brand} ${b.car.model}` : "Deleted car"}</td>
                  <td className="small">{formatDate(b.startDate)} → {formatDate(b.endDate)}</td>
                  <td>{formatPrice(b.totalPrice)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
