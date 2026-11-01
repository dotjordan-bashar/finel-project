import { STATUS_COLORS } from "../utils/constants";
import { capitalize } from "../utils/helpers";

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "secondary";
  return <span className={`badge text-bg-${color}`}>{capitalize(status)}</span>;
}
