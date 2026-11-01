import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CarImage from "../components/CarImage";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import StatusBadge from "../components/StatusBadge";
import { daysBetween, formatPrice, todayString } from "../utils/helpers";

export default function CarDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [booking, setBooking] = useState({ startDate: "", endDate: "", notes: "" });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/cars/${id}`)
      .then((res) => setCar(res.data.car))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const days = daysBetween(booking.startDate, booking.endDate);
  const total = car ? days * car.pricePerDay : 0;

  const handleChange = (e) => setBooking({ ...booking, [e.target.name]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!booking.startDate || !booking.endDate) {
      setBookingError("Please choose pick-up and return dates");
      return;
    }
    if (days < 1) {
      setBookingError("Return date must be after the pick-up date");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", { carId: car._id, ...booking });
      setBookingSuccess("Booking request sent! The owner will confirm it soon.");
      setBooking({ startDate: "", endDate: "", notes: "" });
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container py-5">
        <AlertMessage message={error} />
        <Link to="/cars">&larr; Back to cars</Link>
      </div>
    );
  }

  const isOwner = user && car.owner._id === user._id;

  // The right side of the page depends on who is looking at it
  const renderBookingBox = () => {
    if (!user) {
      return (
        <>
          <p className="text-muted">Log in as a customer to book this car.</p>
          <Link to="/login" state={{ from: `/cars/${car._id}` }} className="btn btn-primary w-100">
            Log in to book
          </Link>
        </>
      );
    }

    if (isOwner) {
      return (
        <>
          <p className="mb-2">This is your car. Status: <StatusBadge status={car.status} /></p>
          <Link to={`/owner/cars/${car._id}/edit`} className="btn btn-outline-primary w-100">
            Edit car
          </Link>
        </>
      );
    }

    if (user.role !== "customer") {
      return <p className="text-muted mb-0">Only customer accounts can make bookings.</p>;
    }

    return (
      <form onSubmit={handleBook} noValidate>
        <AlertMessage message={bookingError} onClose={() => setBookingError("")} />
        <AlertMessage type="success" message={bookingSuccess} />

        <div className="mb-3">
          <label className="form-label" htmlFor="startDate">Pick-up date</label>
          <input id="startDate" name="startDate" type="date" className="form-control" min={todayString()} value={booking.startDate} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="endDate">Return date</label>
          <input id="endDate" name="endDate" type="date" className="form-control" min={booking.startDate || todayString()} value={booking.endDate} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows="2" className="form-control" maxLength={500} value={booking.notes} onChange={handleChange} />
        </div>

        {days > 0 && (
          <div className="d-flex justify-content-between border-top pt-2 mb-3">
            <span>{days} day(s) × {formatPrice(car.pricePerDay)}</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        )}

        <button className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? "Sending..." : "Request booking"}
        </button>

        {bookingSuccess && (
          <Link to="/my-bookings" className="btn btn-link w-100 mt-2">View my bookings</Link>
        )}
      </form>
    );
  };

  const specs = [
    ["bi-calendar", "Year", car.year],
    ["bi-geo-alt", "City", car.city],
    ["bi-tag", "Category", car.category],
    ["bi-gear", "Transmission", car.transmission],
    ["bi-fuel-pump", "Fuel", car.fuelType],
    ["bi-people", "Seats", car.seats],
  ];

  return (
    <div className="container py-4">
      <Link to="/cars" className="btn btn-link px-0 mb-3">&larr; Back to cars</Link>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden">
            <CarImage car={car} className="car-details-image" />
            <div className="card-body">
              <h1 className="h3">
                {car.brand} {car.model}
              </h1>
              <p className="text-muted">Listed by {car.owner.name}</p>

              <div className="row g-3 mb-3">
                {specs.map(([icon, label, value]) => (
                  <div className="col-6 col-md-4" key={label}>
                    <div className="border rounded p-2 h-100">
                      <small className="text-muted d-block">
                        <i className={`bi ${icon} me-1`} />{label}
                      </small>
                      <strong>{value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {car.description && (
                <>
                  <h2 className="h5">About this car</h2>
                  <p className="mb-0">{car.description}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-3 sticky-lg-top" style={{ top: "80px" }}>
            <p className="mb-3">
              <span className="fs-3 fw-bold text-primary">{formatPrice(car.pricePerDay)}</span>
              <span className="text-muted"> / day</span>
            </p>
            {renderBookingBox()}
          </div>
        </div>
      </div>
    </div>
  );
}
