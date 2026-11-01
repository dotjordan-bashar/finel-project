import { Link } from "react-router-dom";
import CarImage from "./CarImage";
import { formatPrice } from "../utils/helpers";

export default function CarCard({ car }) {
  return (
    <div className="card h-100 border-0 shadow-sm car-card overflow-hidden">
      <CarImage car={car} />

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">
            {car.brand} {car.model}
          </h5>
          <span className="badge text-bg-light">{car.year}</span>
        </div>

        <p className="text-muted small mb-2">
          <i className="bi bi-geo-alt me-1" />
          {car.city} · {car.category}
        </p>

        <div className="d-flex gap-3 small text-muted mb-3">
          <span><i className="bi bi-gear me-1" />{car.transmission}</span>
          <span><i className="bi bi-people me-1" />{car.seats}</span>
          <span><i className="bi bi-fuel-pump me-1" />{car.fuelType}</span>
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span>
            <span className="fs-5 fw-bold text-primary">{formatPrice(car.pricePerDay)}</span>
            <span className="text-muted small"> / day</span>
          </span>
          <Link to={`/cars/${car._id}`} className="btn btn-outline-primary btn-sm">
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
