import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import CaseDetailModal from "../components/CaseDetailModal";
import {
  PlusIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  AlertCircleIcon,
} from "../components/Icons";

const emptyForm = {
  clientId: "",
  title: "",
  type: "",
  description: "",
  status: "Open",
  assignedLawyer: "",
};

const statuses = ["Open", "In Progress", "Hearing Scheduled", "Closed"];

const CasesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseIdForDetails, setSelectedCaseIdForDetails] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isFirstCasesRun = useRef(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/cases", { params });
      setCases(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load legal cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data);
    } catch (err) {
      console.error("Unable to load clients", err);
    }
  };

  const fetchLawyers = async () => {
    if (user?.role === "Admin") {
      try {
        const { data } = await api.get("/auth");
        setLawyers(data.filter((u) => u.role === "Lawyer"));
      } catch (err) {
        console.error("Unable to load lawyers", err);
      }
    }
  };

  useEffect(() => {
    fetchClients();
    fetchLawyers();
  }, [user]);

  useEffect(() => {
    if (isFirstCasesRun.current) {
      isFirstCasesRun.current = false;
      fetchCases();
      return;
    }
    const timer = setTimeout(() => {
      fetchCases();
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, statusFilter]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleOpenCreateModal = () => {
    setEditingId("");
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (legalCase) => {
    setEditingId(legalCase._id);
    setForm({
      clientId: legalCase.clientId?._id || legalCase.clientId || "",
      title: legalCase.title || "",
      type: legalCase.type || "",
      description: legalCase.description || "",
      status: legalCase.status || "Open",
      assignedLawyer: legalCase.assignedLawyer?._id || legalCase.assignedLawyer || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = { ...form };
    if (user?.role !== "Admin") {
      payload.assignedLawyer = user?.id;
    }

    try {
      if (editingId) {
        await api.put(`/cases/${editingId}`, payload);
      } else {
        await api.post("/cases", payload);
      }

      setIsModalOpen(false);
      setForm(emptyForm);
      setEditingId("");
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save case");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/cases/${deleteId}`);
      setDeleteId(null);
      if (editingId === deleteId) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete case");
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cases"
        subtitle="Manage and track legal cases across your practice."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            <PlusIcon size={14} />
            <span>Create Case</span>
          </button>
        }
      />

      {error && (
        <div className="alert-banner alert-banner-error" style={{ marginBottom: "16px" }}>
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header" style={{ gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
            <div className="search-input-box">
              <span className="search-icon">
                <SearchIcon size={15} />
              </span>
              <input
                type="text"
                placeholder="Search by title or case type..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    color: "var(--text-muted)",
                  }}
                  aria-label="Clear search"
                >
                  <CloseIcon size={13} />
                </button>
              )}
            </div>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "auto", minWidth: "140px" }}
              aria-label="Filter by case status"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {(keyword || statusFilter) && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setKeyword("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            {cases.length} {cases.length === 1 ? "case" : "cases"}
          </span>
        </div>

        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "32px 16px" }}>
              <LoadingSpinner label="Loading cases..." />
            </div>
          ) : cases.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case Title</th>
                    <th>Client</th>
                    <th>Status</th>
                    {user?.role === "Admin" && <th>Assigned Lawyer</th>}
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedCaseIdForDetails(c._id)}
                          style={{
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          <span className="cell-bold" style={{ color: "var(--text-primary)" }}>
                            {c.title}
                          </span>
                          <div className="cell-sub">{c.type || "General"}</div>
                        </button>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-primary)" }}>
                          {c.clientId?.name || "Direct Client"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      {user?.role === "Admin" && (
                        <td style={{ color: "var(--text-secondary)" }}>
                          {c.assignedLawyer?.name || "Unassigned"}
                        </td>
                      )}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedCaseIdForDetails(c._id)}
                            title="View case details"
                          >
                            <EyeIcon size={13} />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(c)}
                            title="Edit case"
                          >
                            <EditIcon size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteId(c._id)}
                            style={{ color: "var(--status-danger)" }}
                            title="Delete case"
                          >
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-box">
              <p>
                {keyword || statusFilter
                  ? "No cases match your filters."
                  : "No cases registered yet."}
              </p>
              {!keyword && !statusFilter && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenCreateModal}
                >
                  Create your first case
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Case */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Case" : "Create Case"}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="case-form"
              className="btn btn-primary btn-sm"
              disabled={submitting || !form.title.trim()}
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Case"}
            </button>
          </div>
        }
      >
        <form id="case-form" onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="case-client">
              Associated Client
            </label>
            <select
              id="case-client"
              className="form-input"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
            >
              <option value="">No client selected (Direct representation)</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="case-title">
              Case Title <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              id="case-title"
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Vance vs. City Transportation Board"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="case-type">
                Practice Area / Type
              </label>
              <input
                id="case-type"
                className="form-input"
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="e.g. Civil Litigation, Corporate"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="case-status">
                Status
              </label>
              <select
                id="case-status"
                className="form-input"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {user?.role === "Admin" && (
            <div className="form-group">
              <label className="form-label" htmlFor="case-lawyer">
                Assigned Lawyer
              </label>
              <select
                id="case-lawyer"
                className="form-input"
                name="assignedLawyer"
                value={form.assignedLawyer}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {lawyers.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="case-desc">
              Case Description & Summary
            </label>
            <textarea
              id="case-desc"
              className="form-input"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Summary of the claims, legal strategy, or dispute overview..."
            />
          </div>
        </form>
      </Modal>

      {/* Case Details Modal */}
      <CaseDetailModal
        caseId={selectedCaseIdForDetails}
        isOpen={Boolean(selectedCaseIdForDetails)}
        onClose={() => setSelectedCaseIdForDetails(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Case"
        message="Are you sure you want to delete this case? All associated documents and hearings will also be deleted."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default CasesPage;
