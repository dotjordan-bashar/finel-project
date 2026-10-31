import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axios";
import AlertMessage from "../components/AlertMessage";

// Where each role lands after logging in
const HOME_BY_ROLE = { admin: "/admin", owner: "/owner/cars", customer: "/cars" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      // Go back to the page the user tried to open, or to their role's home page
      navigate(location.state?.from || HOME_BY_ROLE[user.role], { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-7 col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h1 className="h3 mb-3 text-center">Welcome back</h1>

            <AlertMessage message={error} onClose={() => setError("")} />

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} />
              </div>
              <button className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              No account yet? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
