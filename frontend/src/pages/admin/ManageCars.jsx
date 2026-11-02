import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { CAR_STATUSES } from "../../utils/constants";
import { capitalize, formatPrice } from "../../utils/helpers";

export default function ManageCars() {
  // The dashboard links here with ?status=pending, so read it as the starting filter
  const [searchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState({ search: "", status: searchParams.get("status") || "", page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCars = () => {
    setLoading(true);
    api
      .get("/admin/cars", { params: query })
      .then((res) => {
        setCars(res.data.cars);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadCars, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery({ ...query, search: searchText, page: 1 });
  };

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/cars/${id}/status`, { status });
      loadCars();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteCar = async (car) => {
    if (!window.confirm(`Delete ${car.brand} ${car.model}?`)) return;
    try {
      await api.delete(`/cars/${car._id}`);
      loadCars();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className="h3 mb-4">Cars</h1>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-6">
          <input className="form-control" placeholder="Search by brand or model" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })} aria-label="Filter by status">
            <option value="">All statuses</option>
            {CAR_STATUSES.map((status) => (
              <option key={status} value={status}>{capitalize(status)}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3 d-grid">
          <button className="btn btn-primary">Search</button>
        </div>
      </form>

      <AlertMessage message={error} onClose={() => setError("")} />

      {loading ? (
        <Loader />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Car</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <Link to={`/cars/${car._id}`}>{car.brand} {car.model}</Link>{" "}
                      <span className="text-muted small">{car.year}</span>
                    </td>
                    <td className="small">{car.owner?.name}</td>
                    <td>{car.city}</td>
                    <td>{formatPrice(car.pricePerDay)}</td>
                    <td><StatusBadge status={car.status} /></td>
                    <td className="text-end text-nowrap-actions">
                      {car.status !== "approved" && (
                        <button className="btn btn-success btn-sm me-2" onClick={() => setStatus(car._id, "approved")}>
                          Approve
                        </button>
                      )}
                      {car.status !== "rejected" && (
                        <button className="btn btn-outline-warning btn-sm me-2" onClick={() => setStatus(car._id, "rejected")}>
                          Reject
                        </button>
                      )}
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteCar(car)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No cars found</td>
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
