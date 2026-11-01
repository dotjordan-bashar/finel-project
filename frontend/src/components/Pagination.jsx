// Page buttons: « 1 2 3 »
export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pages" className="mt-4">
      <ul className="pagination justify-content-center flex-wrap">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)}>
            &laquo;
          </button>
        </li>

        {numbers.map((number) => (
          <li key={number} className={`page-item ${number === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}

        <li className={`page-item ${page === pages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)}>
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}
