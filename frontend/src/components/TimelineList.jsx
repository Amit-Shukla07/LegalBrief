import { ClockIcon } from "./Icons";

const TimelineList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="empty-box">
        <p>No timeline activity recorded for this case yet.</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", padding: "16px 8px 16px 20px" }}>
      {/* Continuous vertical timeline guide line */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          bottom: "24px",
          left: "27px",
          width: "2px",
          backgroundColor: "var(--border)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {items.map((item) => {
          const dateObj = new Date(item.timestamp);
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div
              key={item._id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                zIndex: 1,
              }}
            >
              {/* Timeline Dot Marker */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-surface)",
                  border: "2px solid var(--accent)",
                  marginTop: "2px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />

              {/* Content Box */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "13.5px",
                    lineHeight: 1.5,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.activity}
                </p>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>
                    {formattedDate} at {formattedTime}
                  </span>
                  {item.createdBy?.name && (
                    <>
                      <span>•</span>
                      <span>by {item.createdBy.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineList;
