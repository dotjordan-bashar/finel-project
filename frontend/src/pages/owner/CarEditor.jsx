import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import { CITIES, CATEGORIES, TRANSMISSIONS, FUEL_TYPES } from "../../utils/constants";

const EMPTY_CAR = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  pricePerDay: "",
  city: "",
  category: "",
  transmission: "",
  fuelType: "",
  seats: 5,
  imageUrl: "",
  description: "",
};

const MAX_YEAR = new Date().getFullYear() + 1;

const validateCar = (car) => {
  const errors = {};
  if (!car.brand.trim()) errors.brand = "Brand is required";
  if (!car.model.trim()) errors.model = "Model is required";
  if (car.year < 1990 || car.year > MAX_YEAR) errors.year = `Year must be between 1990 and ${MAX_YEAR}`;
  if (!car.pricePerDay || car.pricePerDay < 1) errors.pricePerDay = "Price must be at least 1 JD";
  if (!car.city) errors.city = "Choose a city";
  if (!car.category) errors.category = "Choose a category";
  if (!car.transmission) errors.transmission = "Choose a transmission";
  if (!car.fuelType) errors.fuelType = "Choose a fuel type";
  if (car.seats < 2 || car.seats > 15) errors.seats = "Seats must be between 2 and 15";
  if (car.imageUrl && !/^https?:\/\/.+/.test(car.imageUrl)) errors.imageUrl = "Image must be a link starting with http";
  return errors;
};

// One page for both "Add car" (/owner/cars/new) and "Edit car" (/owner/cars/:id/edit)
export default function CarEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [car, setCar] = useState(EMPTY_CAR);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // When editing, load the existing car into the form
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/cars/${id}`)
      .then((res) => {
        const data = res.data.car;
        const formValues = {};
        Object.keys(EMPTY_CAR).forEach((key) => (formValues[key] = data[key] ?? ""));
        setCar(formValues);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setCar({ ...car, [name]: type === "number" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validateCar(car);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/cars/${id}`, car);
      } else {
        await api.post("/cars", car);
      }
      navigate("/owner/cars");
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const inputClass = (name) => `form-control ${fieldErrors[name] ? "is-invalid" : ""}`;
  const selectClass = (name) => `form-select ${fieldErrors[name] ? "is-invalid" : ""}`;

  const renderSelect = (name, label, options) => (
    <div className="col-md-6 col-lg-3">
      <label className="form-label" htmlFor={name}>{label}</label>
      <select id={name} name={name} className={selectClass(name)} value={car[name]} onChange={handleChange}>
        <option value="">Choose...</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="invalid-feedback">{fieldErrors[name]}</div>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <Link to="/owner/cars" className="btn btn-link px-0 mb-2">&larr; Back to my cars</Link>
      <h1 className="h3 mb-3">{isEdit ? "Edit car" : "Add a new car"}</h1>

      {isEdit && (
        <div className="alert alert-info small">
          Saving changes sends the car back to the admin for review.
        </div>
      )}

      <AlertMessage message={error} onClose={() => setError("")} />

      <form className="card border-0 shadow-sm p-4" onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="brand">Brand</label>
            <input id="brand" name="brand" className={inputClass("brand")} placeholder="Toyota" value={car.brand} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.brand}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="model">Model</label>
            <input id="model" name="model" className={inputClass("model")} placeholder="Corolla" value={car.model} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.model}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="year">Year</label>
            <input id="year" name="year" type="number" className={inputClass("year")} value={car.year} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.year}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pricePerDay">Price per day (JD)</label>
            <input id="pricePerDay" name="pricePerDay" type="number" min="1" className={inputClass("pricePerDay")} value={car.pricePerDay} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.pricePerDay}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="seats">Seats</label>
            <input id="seats" name="seats" type="number" min="2" max="15" className={inputClass("seats")} value={car.seats} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.seats}</div>
          </div>

          {renderSelect("city", "City", CITIES)}
          {renderSelect("category", "Category", CATEGORIES)}
          {renderSelect("transmission", "Transmission", TRANSMISSIONS)}
          {renderSelect("fuelType", "Fuel type", FUEL_TYPES)}

          <div className="col-12">
            <label className="form-label" htmlFor="imageUrl">Image URL (optional)</label>
            <input id="imageUrl" name="imageUrl" className={inputClass("imageUrl")} placeholder="https://..." value={car.imageUrl} onChange={handleChange} />
            <div className="invalid-feedback">{fieldErrors.imageUrl}</div>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">Description (optional)</label>
            <textarea id="description" name="description" rows="3" maxLength={1000} className="form-control" value={car.description} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add car"}
          </button>
          <Link to="/owner/cars" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
