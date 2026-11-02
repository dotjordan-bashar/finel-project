import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import Pagination from "../../components/Pagination";
import { BOOKING_STATUSES } from "../../utils/constants";
import { capitalize, formatDate, formatPrice } from "../../utils/helpers";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [query, setQuery] = useState({ status: "", page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = () => {
    setLoading(true);
    api
      .get("/admin/bookings", { params: query })
      .then((res) => {
        setBookings(res.data.bookings);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, [query]);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 mb-0">Bookings</h1>
        <select
          className="form-select w-auto"
          value={query.status}
          onChange={(e) => setQuery({ status: e.target.value, page: 1 })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>{capitalize(status)}</option>
          ))}
        </select>
      </div>

      <AlertMessage message={error} onClose={() => setError("")} />

      {loading ? (
        <Loader />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end">Delete</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      {b.customer?.name || "Deleted user"}
                      <div className="small text-muted">{b.customer?.email}</div>
                    </td>
                    <td>{b.car ? `${b.car.brand} ${b.car.model}` : "Deleted car"}</td>
                    <td className="small">{formatDate(b.startDate)} → {formatDate(b.endDate)}</td>
                    <td>{formatPrice(b.totalPrice)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={b.status}
                        onChange={(e) => changeStatus(b._id, e.target.value)}
                        aria-label="Change status"
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status}>{capitalize(status)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteBooking(b._id)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(page) => setQuery({ ...query, page })} />
    </>
  );
}
