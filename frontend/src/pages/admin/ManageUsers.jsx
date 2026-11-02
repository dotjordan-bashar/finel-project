import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import Pagination from "../../components/Pagination";
import { ROLES } from "../../utils/constants";
import { capitalize, formatDate } from "../../utils/helpers";

export default function ManageUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState({ search: "", role: "", page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/admin/users", { params: query })
      .then((res) => {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  // Reload whenever the search, role filter or page changes
  useEffect(loadUsers, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery({ ...query, search: searchText, page: 1 });
  };

  const updateUser = async (id, changes) => {
    try {
      await api.patch(`/admin/users/${id}`, changes);
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? Their cars and bookings will be deleted too.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className="h3 mb-4">Users</h1>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-6">
          <input className="form-control" placeholder="Search by name or email" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={query.role} onChange={(e) => setQuery({ ...query, role: e.target.value, page: 1 })} aria-label="Filter by role">
            <option value="">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{capitalize(role)}</option>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isMe = user._id === currentUser._id;
                  return (
                    <tr key={user._id}>
                      <td>{user.name} {isMe && <span className="badge text-bg-light">You</span>}</td>
                      <td className="small">{user.email}</td>
                      <td>
                        <select
                          className="form-select form-select-sm w-auto"
                          value={user.role}
                          disabled={isMe}
                          onChange={(e) => updateUser(user._id, { role: e.target.value })}
                          aria-label="Change role"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>{capitalize(role)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`badge text-bg-${user.isActive ? "success" : "secondary"}`}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="small">{formatDate(user.createdAt)}</td>
                      <td className="text-end text-nowrap-actions">
                        {!isMe && (
                          <>
                            <button
                              className="btn btn-outline-secondary btn-sm me-2"
                              onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                            >
                              {user.isActive ? "Disable" : "Enable"}
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => deleteUser(user)}>
                              <i className="bi bi-trash" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No users found</td>
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
