import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

import MyCars from "./pages/owner/MyCars";
import CarEditor from "./pages/owner/CarEditor";
import OwnerBookings from "./pages/owner/OwnerBookings";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCars from "./pages/admin/ManageCars";
import ManageBookings from "./pages/admin/ManageBookings";

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Customers only */}
          <Route element={<ProtectedRoute roles={["customer"]} />}>
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          {/* Owners only */}
          <Route element={<ProtectedRoute roles={["owner"]} />}>
            <Route path="/owner/cars" element={<MyCars />} />
            <Route path="/owner/cars/new" element={<CarEditor />} />
            <Route path="/owner/cars/:id/edit" element={<CarEditor />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
          </Route>

          {/* Admins only - all admin pages share the sidebar layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="cars" element={<ManageCars />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
