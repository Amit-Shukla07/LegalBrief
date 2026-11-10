import { useEffect, useState } from "react";
import api from "../api/client";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import LoadingSpinner from "./LoadingSpinner";
import {
  FileIcon,
  CalendarIcon,
  ExternalLinkIcon,
  UserIcon,
} from "./Icons";

const CaseDetailModal = ({ caseId, isOpen, onClose }) => {
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");

  const serverBaseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

  useEffect(() => {
    if (!caseId || !isOpen) {
      setCaseDetails(null);
      return;
    }

    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/cases/${caseId}`);
        setCaseDetails(data);
        setActiveTab("overview");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [caseId, isOpen]);

  if (!isOpen) return null;

  const docs = caseDetails?.documents || [];
  const hearings = caseDetails?.hearings || [];
  const timeline = caseDetails?.timeline || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseDetails ? caseDetails.title : "Case Details"}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: "32px 16px" }}>
          <LoadingSpinner label="Loading case details..." />
        </div>
      ) : error ? (
        <div className="alert-banner alert-banner-error">{error}</div>
      ) : caseDetails ? (
        <div>
          {/* Header Summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border)",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {caseDetails.type || "General Case"}
              </span>
              <h2
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {caseDetails.title}
              </h2>
            </div>
            <StatusBadge status={caseDetails.status} />
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              borderBottom: "1px solid var(--border)",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{
                borderBottom: activeTab === "overview" ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius: "0",
                fontWeight: activeTab === "overview" ? 600 : 400,
                color: activeTab === "overview" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{
                borderBottom: activeTab === "documents" ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius: "0",
                fontWeight: activeTab === "documents" ? 600 : 400,
                color: activeTab === "documents" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onClick={() => setActiveTab("documents")}
            >
              Documents ({docs.length})
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{
                borderBottom: activeTab === "hearings" ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius: "0",
                fontWeight: activeTab === "hearings" ? 600 : 400,
                color: activeTab === "hearings" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onClick={() => setActiveTab("hearings")}
            >
              Hearings ({hearings.length})
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{
                borderBottom: activeTab === "timeline" ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius: "0",
                fontWeight: activeTab === "timeline" ? 600 : 400,
                color: activeTab === "timeline" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline ({timeline.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label" style={{ marginBottom: "4px" }}>
                  Description
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "var(--bg-muted)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {caseDetails.description || "No description provided."}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Client</span>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", marginTop: "2px" }}>
                    {caseDetails.clientId?.name || "Direct Client"}
                  </div>
                  {caseDetails.clientId?.contactInfo?.email && (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {caseDetails.clientId.contactInfo.email}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Assigned Lawyer</span>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", marginTop: "2px" }}>
                    {caseDetails.assignedLawyer?.name || "Unassigned"}
                  </div>
                  {caseDetails.assignedLawyer?.email && (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {caseDetails.assignedLawyer.email}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Created Date</span>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", marginTop: "2px" }}>
                    {caseDetails.createdAt
                      ? new Date(caseDetails.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Documents */}
          {activeTab === "documents" && (
            <div>
              {docs.length === 0 ? (
                <div className="empty-box">
                  <p>No documents uploaded for this case.</p>
                </div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Uploaded</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc) => {
                        const fileHref = doc.filePath?.startsWith("http")
                          ? doc.filePath
                          : `${serverBaseUrl}/${doc.filePath?.replace(/\\/g, "/")}`;
                        return (
                          <tr key={doc._id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FileIcon size={14} />
                                <span className="cell-bold">{doc.filename}</span>
                              </div>
                            </td>
                            <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <a
                                href={fileHref}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                              >
                                <span>Open</span>
                                <ExternalLinkIcon size={12} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Hearings */}
          {activeTab === "hearings" && (
            <div>
              {hearings.length === 0 ? (
                <div className="empty-box">
                  <p>No hearings scheduled for this case.</p>
                </div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hearings.map((h) => {
                        const d = new Date(h.hearingDate);
                        return (
                          <tr key={h._id}>
                            <td>
                              <span className="cell-bold">
                                {d.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <div className="cell-sub">
                                {d.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td>{h.location || "Courtroom TBD"}</td>
                            <td style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}>
                              {h.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Timeline */}
          {activeTab === "timeline" && (
            <div>
              {timeline.length === 0 ? (
                <div className="empty-box">
                  <p>No timeline events recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {timeline.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-surface)",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {item.activity}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {item.createdBy?.name && ` • by ${item.createdBy.name}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default CaseDetailModal;
