import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CarCard from "../components/CarCard";
import Loader from "../components/Loader";
import { CITIES } from "../utils/constants";

const FEATURES = [
  { icon: "bi-shield-check", title: "Verified cars", text: "Every car is reviewed by our team before it is listed." },
  { icon: "bi-geo-alt", title: "All over Jordan", text: "Pick up a car in Amman, Aqaba, Irbid and more." },
  { icon: "bi-cash-coin", title: "Clear prices", text: "One daily price, calculated for you before you book." },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [latestCars, setLatestCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/cars?limit=6")
      .then((res) => setLatestCars(res.data.cars))
      .catch(() => setLatestCars([]))
      .finally(() => setLoading(false));
  }, []);

  // Send the search to the cars page as URL parameters
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city) params.set("city", city);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1 className="display-5 fw-bold">Rent the right car, anywhere in Jordan</h1>
              <p className="lead opacity-75">
                Browse cars from trusted local owners, compare prices and book in minutes.
              </p>
            </div>

            <div className="col-lg-6">
              <form className="hero-search shadow" onSubmit={handleSearch}>
                <div className="row g-2">
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Brand or model"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="">Any city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 d-grid">
                    <button className="btn btn-primary" type="submit">
                      <i className="bi bi-search me-1" /> Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4 text-center">
          {FEATURES.map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <i className={`bi ${feature.icon} fs-1 text-primary`} />
              <h5 className="mt-2">{feature.title}</h5>
              <p className="text-muted mb-0">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Latest cars</h2>
          <Link to="/cars" className="btn btn-link">See all cars &rarr;</Link>
        </div>

        {loading ? (
          <Loader />
        ) : latestCars.length === 0 ? (
          <p className="text-muted">No cars listed yet.</p>
        ) : (
          <div className="row g-4">
            {latestCars.map((car) => (
              <div className="col-sm-6 col-lg-4" key={car._id}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
