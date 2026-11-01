import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import CarCard from "../components/CarCard";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import { CITIES, CATEGORIES, TRANSMISSIONS, FUEL_TYPES, SORT_OPTIONS } from "../utils/constants";

const FILTER_KEYS = ["search", "city", "category", "transmission", "fuelType", "minPrice", "maxPrice"];

// Read the current filters from the URL into a plain object
const filtersFromParams = (params) => {
  const filters = {};
  FILTER_KEYS.forEach((key) => (filters[key] = params.get(key) || ""));
  return filters;
};

export default function Cars() {
  // The filters live in the URL (?city=Amman&page=2) so the page can be shared and refreshed
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(filtersFromParams(searchParams));

  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load cars every time the URL parameters change
  useEffect(() => {
    setLoading(true);
    setError("");
    setFilters(filtersFromParams(searchParams));

    api
      .get(`/cars?${searchParams.toString()}`)
      .then((res) => {
        setCars(res.data.cars);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  // Write the filters into the URL (this triggers the useEffect above)
  const applyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (searchParams.get("sort")) params.set("sort", searchParams.get("sort"));
    setSearchParams(params);
  };

  const resetFilters = () => setSearchParams({});

  // Change one URL parameter (used for sort and page)
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page"); // new sort -> back to page 1
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSelect = (name, label, options) => (
    <div className="mb-3">
      <label className="form-label small fw-semibold" htmlFor={name}>{label}</label>
      <select id={name} name={name} className="form-select form-select-sm" value={filters[name]} onChange={handleChange}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Browse cars</h1>

      <div className="row g-4">
        {/* Filters */}
        <aside className="col-lg-3">
          <form className="card border-0 shadow-sm p-3" onSubmit={applyFilters}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" htmlFor="search">Search</label>
              <input id="search" name="search" type="text" className="form-control form-control-sm" placeholder="Brand or model" value={filters.search} onChange={handleChange} />
            </div>

            {renderSelect("city", "City", CITIES)}
            {renderSelect("category", "Category", CATEGORIES)}
            {renderSelect("transmission", "Transmission", TRANSMISSIONS)}
            {renderSelect("fuelType", "Fuel", FUEL_TYPES)}

            <label className="form-label small fw-semibold">Price per day (JD)</label>
            <div className="d-flex gap-2 mb-3">
              <input name="minPrice" type="number" min="0" className="form-control form-control-sm" placeholder="Min" value={filters.minPrice} onChange={handleChange} />
              <input name="maxPrice" type="number" min="0" className="form-control form-control-sm" placeholder="Max" value={filters.maxPrice} onChange={handleChange} />
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-primary btn-sm" type="submit">Apply filters</button>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={resetFilters}>Reset</button>
            </div>
          </form>
        </aside>

        {/* Results */}
        <section className="col-lg-9">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span className="text-muted">{pagination.total} cars found</span>
            <select
              className="form-select form-select-sm w-auto"
              value={searchParams.get("sort") || "newest"}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort cars"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <AlertMessage message={error} />

          {loading ? (
            <Loader />
          ) : cars.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-search fs-1" />
              <p className="mt-2">No cars match your filters.</p>
            </div>
          ) : (
            <div className="row g-4">
              {cars.map((car) => (
                <div className="col-sm-6 col-xl-4" key={car._id}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(page) => updateParam("page", page)}
          />
        </section>
      </div>
    </div>
  );
}
