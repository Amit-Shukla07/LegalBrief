import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { PlusIcon, CalendarIcon } from "../components/Icons";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/dashboard/summary");
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div style={{ padding: "32px 0", color: "var(--text-secondary)" }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert-banner alert-banner-error">{error}</div>;
  }

  const counts = summary?.counts || {};
  const totalCases = counts.totalCases || 0;
  const openCases = (counts.Open || 0) + (counts["In Progress"] || 0);
  const upcomingHearings = counts.upcomingHearings || 0;
  const documents = counts.totalDocuments || 0;

  const recentCases = summary?.recentCases || [];
  const hearingsList = summary?.upcomingHearings || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Overview of your clients, cases, documents, and upcoming hearings.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/hearings")}
          >
            <CalendarIcon size={14} />
            <span>Schedule Hearing</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/cases")}
          >
            <PlusIcon size={14} />
            <span>Create Case</span>
          </button>
        </div>
      </div>

      {/* Compact Horizontal Statistics */}
      <section className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Cases</span>
          <span className="stat-value">{totalCases}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Open Cases</span>
          <span className="stat-value">{openCases}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Upcoming Hearings</span>
          <span className="stat-value">{upcomingHearings}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Documents</span>
          <span className="stat-value">{documents}</span>
        </div>
      </section>

      {/* Two-Column Main Content */}
      <div className="dashboard-layout">
        {/* Main Section: Recent Cases */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Cases</h2>
            <Link
              to="/cases"
              style={{ fontSize: "12.5px", color: "var(--accent)", fontWeight: 500 }}
            >
              View all
            </Link>
          </div>

          <div className="card-body-flush">
            {recentCases.length > 0 ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case Title</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <span className="cell-bold">{c.title}</span>
                          <div className="cell-sub">{c.type}</div>
                        </td>
                        <td>{c.clientId?.name || "Direct Client"}</td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {c.updatedAt
                            ? new Date(c.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate("/cases")}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-box">
                <p>No cases created yet.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/cases")}
                >
                  Create your first case
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Section: Upcoming Hearings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Hearings</h2>
            <Link
              to="/hearings"
              style={{ fontSize: "12.5px", color: "var(--accent)", fontWeight: 500 }}
            >
              All hearings
            </Link>
          </div>

          <div className="card-body-flush">
            {hearingsList.length > 0 ? (
              <div>
                {hearingsList.map((h) => {
                  const d = new Date(h.hearingDate);
                  const dateStr = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <div key={h._id} className="hearing-row">
                      <div className="hearing-info">
                        <span className="hearing-case-name">{h.caseId?.title || "Hearing"}</span>
                        <div className="hearing-meta">
                          <span>{timeStr}</span>
                          {h.location && (
                            <>
                              <span>•</span>
                              <span>{h.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="hearing-date-badge">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-box">
                <p>No hearings scheduled in the next 7 days.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/hearings")}
                >
                  Schedule hearing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
