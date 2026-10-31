// A Bootstrap alert. Renders nothing when there is no message.
export default function AlertMessage({ type = "danger", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} d-flex justify-content-between align-items-center`} role="alert">
      <span>{message}</span>
      {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />}
    </div>
  );
}
