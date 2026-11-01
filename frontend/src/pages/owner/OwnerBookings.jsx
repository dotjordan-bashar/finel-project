import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatPrice } from "../../utils/helpers";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = () => {
    api
      .get("/bookings/owner")
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // The buttons the owner sees depend on the current status
  const renderActions = (booking) => {
    if (booking.status === "pending") {
      return (
        <>
          <button className="btn btn-success btn-sm me-2" onClick={() => changeStatus(booking._id, "confirmed")}>
            Accept
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => changeStatus(booking._id, "cancelled")}>
            Reject
          </button>
        </>
      );
    }
    if (booking.status === "confirmed") {
      return (
        <button className="btn btn-outline-success btn-sm" onClick={() => changeStatus(booking._id, "completed")}>
          Mark completed
        </button>
      );
    }
    return null;
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Booking requests</h1>
      <AlertMessage message={error} onClose={() => setError("")} />

      {bookings.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-inbox fs-1" />
          <p className="mt-2">No bookings on your cars yet.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.car.brand} {b.car.model}</td>
                    <td>
                      {b.customer.name}
                      <div className="small text-muted">{b.customer.phone || b.customer.email}</div>
                    </td>
                    <td className="small">
                      {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      {b.notes && <div className="text-muted fst-italic">"{b.notes}"</div>}
                    </td>
                    <td>{formatPrice(b.totalPrice)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-end text-nowrap-actions">{renderActions(b)}</td>
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
