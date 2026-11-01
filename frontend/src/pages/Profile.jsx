import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AlertMessage from "../components/AlertMessage";
import { capitalize } from "../utils/helpers";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({ name: user.name, phone: user.phone || "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.name.trim().length < 3) return setError("Name must be at least 3 characters");
    if (form.phone && !/^07[789]\d{7}$/.test(form.phone)) return setError("Use a Jordanian number like 0791234567");
    if (form.password && form.password.length < 6) return setError("New password must be at least 6 characters");

    setSaving(true);
    try {
      const res = await api.put("/auth/me", form);
      setUser(res.data.user);
      setForm({ ...form, password: "" });
      setSuccess("Profile updated");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h1 className="h3">My profile</h1>
            <p className="text-muted">
              {user.email} · <span className="badge text-bg-primary">{capitalize(user.role)}</span>
            </p>

            <AlertMessage message={error} onClose={() => setError("")} />
            <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="name">Full name</label>
                <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" className="form-control" placeholder="0791234567" value={form.phone} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">New password</label>
                <input id="password" name="password" type="password" className="form-control" placeholder="Leave empty to keep the current one" value={form.password} onChange={handleChange} />
              </div>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
