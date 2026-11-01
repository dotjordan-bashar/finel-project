import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import { formatPrice } from "../../utils/helpers";

export default function MyCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCars = () => {
    api
      .get("/cars/mine")
      .then((res) => setCars(res.data.cars))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadCars, []);

  // Show / hide the car for customers without needing a new admin review
  const toggleAvailability = async (car) => {
    try {
      await api.put(`/cars/${car._id}`, { isAvailable: !car.isAvailable });
      loadCars();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteCar = async (car) => {
    if (!window.confirm(`Delete ${car.brand} ${car.model}? Its bookings will be deleted too.`)) return;
    try {
      await api.delete(`/cars/${car._id}`);
      loadCars();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 mb-0">My cars</h1>
        <Link to="/owner/cars/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" /> Add a car
        </Link>
      </div>

      <AlertMessage message={error} onClose={() => setError("")} />

      {cars.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-car-front fs-1" />
          <p className="mt-2">You have not listed any cars yet.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Car</th>
                  <th>City</th>
                  <th>Price</th>
                  <th>Review</th>
                  <th>Visible</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <Link to={`/cars/${car._id}`}>
                        {car.brand} {car.model}
                      </Link>{" "}
                      <span className="text-muted small">{car.year}</span>
                    </td>
                    <td>{car.city}</td>
                    <td>{formatPrice(car.pricePerDay)}</td>
                    <td><StatusBadge status={car.status} /></td>
                    <td>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={car.isAvailable}
                          onChange={() => toggleAvailability(car)}
                          aria-label="Visible to customers"
                        />
                      </div>
                    </td>
                    <td className="text-end text-nowrap-actions">
                      <Link to={`/owner/cars/${car._id}/edit`} className="btn btn-outline-primary btn-sm me-2">
                        <i className="bi bi-pencil" />
                      </Link>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteCar(car)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-muted small mt-3">
        New and edited cars are reviewed by an admin before customers can see them.
      </p>
    </div>
  );
}
