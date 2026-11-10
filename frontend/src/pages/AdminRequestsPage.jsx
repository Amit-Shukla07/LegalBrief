import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  CheckIcon,
  CloseIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "../components/Icons";

const AdminRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "approve", // 'approve' | 'reject'
    requestId: null,
    userName: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin-requests");
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchRequests();
    }
  }, [user]);

  const handleApprove = async (id) => {
    setActionInProgressId(id);
    try {
      const { data } = await api.patch(`/admin-requests/${id}/approve`);
      setMessage(data.message || "User successfully promoted to Admin");
      setError("");
      setConfirmModal({ isOpen: false, type: "approve", requestId: null, userName: "" });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve request");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (id) => {
    setActionInProgressId(id);
    try {
      const { data } = await api.patch(`/admin-requests/${id}/reject`);
      setMessage(data.message || "Admin access request rejected");
      setError("");
      setConfirmModal({ isOpen: false, type: "reject", requestId: null, userName: "" });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reject request");
    } finally {
      setActionInProgressId(null);
    }
  };

  if (user?.role !== "Admin") {
    return (
      <div>
        <PageHeader
          title="Admin Requests"
          subtitle="Administrative access management."
        />
        <div className="alert-banner alert-banner-error">
          <AlertCircleIcon size={16} />
          <span>Access Denied. Only administrators can view this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Requests"
        subtitle="Review and process requests for administrator privileges."
      />

      {error && (
        <div className="alert-banner alert-banner-error" style={{ marginBottom: "16px" }}>
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert-banner alert-banner-success" style={{ marginBottom: "16px" }}>
          <CheckCircleIcon size={16} />
          <span>{message}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ gap: "12px", flexWrap: "wrap" }}>
          <h2 className="card-title">Pending & Past Requests</h2>
          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            {requests.length} {requests.length === 1 ? "request" : "requests"} total
          </span>
        </div>

        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "32px 16px" }}>
              <LoadingSpinner label="Loading requests..." />
            </div>
          ) : requests.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Requested Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <span className="cell-bold">{req.userId?.name || "User"}</span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {req.userId?.email || "—"}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {req.status === "Pending" ? (
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "approve",
                                  requestId: req._id,
                                  userName: req.userId?.name || "this user",
                                })
                              }
                              disabled={actionInProgressId === req._id}
                            >
                              <CheckIcon size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "reject",
                                  requestId: req._id,
                                  userName: req.userId?.name || "this user",
                                })
                              }
                              disabled={actionInProgressId === req._id}
                            >
                              <CloseIcon size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-box">
              <p>No admin access requests found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === "approve" ? "Approve Admin Request" : "Reject Admin Request"}
        message={`Are you sure you want to ${confirmModal.type} the administrator request for ${confirmModal.userName}?`}
        confirmLabel={confirmModal.type === "approve" ? "Approve" : "Reject"}
        variant={confirmModal.type === "approve" ? "primary" : "danger"}
        onConfirm={() => {
          if (confirmModal.type === "approve") {
            handleApprove(confirmModal.requestId);
          } else {
            handleReject(confirmModal.requestId);
          }
        }}
        onCancel={() =>
          setConfirmModal({ isOpen: false, type: "approve", requestId: null, userName: "" })
        }
      />
    </div>
  );
};

export default AdminRequestsPage;
