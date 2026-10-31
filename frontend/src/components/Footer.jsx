export default function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>
          <i className="bi bi-car-front-fill text-primary me-2" />
          DriveJo · Car rental across Jordan
        </span>
        <span>&copy; {new Date().getFullYear()} DriveJo</span>
      </div>
    </footer>
  );
}
