const StatusBadge = ({ status }) => {
  if (!status) return null;

  const text = status.toString().trim();
  const lower = text.toLowerCase();

  let modifier = "status-closed";
  if (lower === "open") modifier = "status-open";
  else if (lower === "in progress") modifier = "status-in-progress";
  else if (lower.includes("hearing")) modifier = "status-hearing-scheduled";
  else if (lower === "pending") modifier = "status-pending";
  else if (lower === "approved") modifier = "status-approved";
  else if (lower === "rejected") modifier = "status-rejected";

  return (
    <span className={`status-badge ${modifier}`}>
      <span className="status-badge-dot" />
      {text}
    </span>
  );
};

export default StatusBadge;
