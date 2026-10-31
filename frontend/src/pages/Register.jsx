import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axios";
import AlertMessage from "../components/AlertMessage";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer" };

// Check the form before sending it; returns { fieldName: "error message" }
const validateForm = (form) => {
  const errors = {};
  if (form.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Please enter a valid email";
  if (form.phone && !/^07[789]\d{7}$/.test(form.phone)) errors.phone = "Use a Jordanian number like 0791234567";
  if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
  return errors;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const { confirmPassword, ...data } = form; // confirmPassword is only for the form
      const user = await register(data);
      navigate(user.role === "owner" ? "/owner/cars" : "/cars", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Small helper so every input is written the same way
  const renderInput = (name, label, type = "text", placeholder = "") => (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`form-control ${fieldErrors[name] ? "is-invalid" : ""}`}
        value={form[name]}
        onChange={handleChange}
      />
      <div className="invalid-feedback">{fieldErrors[name]}</div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h1 className="h3 mb-3 text-center">Create your account</h1>

            <AlertMessage message={error} onClose={() => setError("")} />

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label d-block">I want to</label>
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="role" id="role-customer" value="customer" checked={form.role === "customer"} onChange={handleChange} />
                  <label className="btn btn-outline-primary" htmlFor="role-customer">
                    <i className="bi bi-key me-1" /> Rent a car
                  </label>
                  <input type="radio" className="btn-check" name="role" id="role-owner" value="owner" checked={form.role === "owner"} onChange={handleChange} />
                  <label className="btn btn-outline-primary" htmlFor="role-owner">
                    <i className="bi bi-car-front me-1" /> List my car
                  </label>
                </div>
              </div>

              {renderInput("name", "Full name")}
              {renderInput("email", "Email", "email")}
              {renderInput("phone", "Phone (optional)", "tel", "0791234567")}
              <div className="row">
                <div className="col-md-6">{renderInput("password", "Password", "password")}</div>
                <div className="col-md-6">{renderInput("confirmPassword", "Confirm password", "password")}</div>
              </div>

              <button className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
