import { useState } from "react";

// Shows the car photo, or a placeholder if there is no photo / it fails to load
export default function CarImage({ car, className = "car-image" }) {
  const [failed, setFailed] = useState(false);

  if (!car.imageUrl || failed) {
    return (
      <div className={`car-placeholder ${className}`}>
        <i className="bi bi-car-front-fill" />
        <span className="fw-semibold">{car.brand}</span>
      </div>
    );
  }

  return (
    <img
      src={car.imageUrl}
      alt={`${car.brand} ${car.model}`}
      className={`w-100 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
