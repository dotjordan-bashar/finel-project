import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatPrice } from "../utils/helpers";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = () => {
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: "cancelled" });
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">My bookings</h1>
      <AlertMessage message={error} onClose={() => setError("")} />

      {bookings.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-calendar-x fs-1" />
          <p className="mt-2">You have no bookings yet.</p>
          <Link to="/cars" className="btn btn-primary">Browse cars</Link>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Car</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      {b.car ? (
                        <Link to={`/cars/${b.car._id}`}>
                          {b.car.brand} {b.car.model}
                        </Link>
                      ) : (
                        <span className="text-muted">Car removed</span>
                      )}
                    </td>
                    <td className="small">
                      {formatDate(b.startDate)} → {formatDate(b.endDate)}
                    </td>
                    <td>{formatPrice(b.totalPrice)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-end">
                      {["pending", "confirmed"].includes(b.status) && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => cancelBooking(b._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
