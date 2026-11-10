import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PlusIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
} from "../components/Icons";

const emptyForm = {
  caseId: "",
  hearingDate: "",
  location: "",
  notes: "",
};

const HearingsPage = () => {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // 'all', 'upcoming', 'past'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      const { data } = await api.get("/cases");
      setCases(data);
      if (!editingId && !form.caseId && data.length) {
        setForm((current) => ({ ...current, caseId: data[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hearings");
      setHearings(data);

      // Check for 24-hour upcoming reminder
      const upcoming = data.find((hearing) => {
        const diff = new Date(hearing.hearingDate).getTime() - Date.now();
        return diff > 0 && diff <= 24 * 60 * 60 * 1000;
      });

      if (upcoming && !sessionStorage.getItem(`hearing-alert-${upcoming._id}`)) {
        sessionStorage.setItem(`hearing-alert-${upcoming._id}`, "true");
        window.alert(
          `Court Hearing Reminder: "${upcoming.caseId?.title || "A matter"}" has a hearing on ${new Date(
            upcoming.hearingDate
          ).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: true,
          })}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hearings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchHearings();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleOpenCreateModal = () => {
    setEditingId("");
    setForm({
      ...emptyForm,
      caseId: cases[0]?._id || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (hearing) => {
    setEditingId(hearing._id);
    const d = new Date(hearing.hearingDate);
    const pad = (n) => String(n).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;

    setForm({
      caseId: hearing.caseId?._id || hearing.caseId || "",
      hearingDate: localIso,
      location: hearing.location || "",
      notes: hearing.notes || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/hearings/${editingId}`, form);
      } else {
        await api.post("/hearings", form);
      }

      setIsModalOpen(false);
      setForm(emptyForm);
      setEditingId("");
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save hearing");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hearings/${deleteId}`);
      setDeleteId(null);
      if (editingId === deleteId) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete hearing");
      setDeleteId(null);
    }
  };

  const now = Date.now();
  const filteredHearings = hearings.filter((h) => {
    const hearingTime = new Date(h.hearingDate).getTime();
    if (tab === "upcoming" && hearingTime < now) return false;
    if (tab === "past" && hearingTime >= now) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = h.caseId?.title?.toLowerCase().includes(q);
      const locMatch = h.location?.toLowerCase().includes(q);
      const notesMatch = h.notes?.toLowerCase().includes(q);
      const clientMatch = h.caseId?.clientId?.name?.toLowerCase().includes(q);
      return titleMatch || locMatch || notesMatch || clientMatch;
    }

    return true;
  });

  return (
    <div>
      <PageHeader
        title="Hearings"
        subtitle="Manage scheduled court hearings and proceedings."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            <PlusIcon size={14} />
            <span>Schedule Hearing</span>
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
            {/* Simple Segmented Control */}
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "var(--bg-muted)",
                borderRadius: "var(--radius-sm)",
                padding: "2px",
                border: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTab("all")}
                style={{
                  backgroundColor: tab === "all" ? "var(--bg-surface)" : "transparent",
                  fontWeight: tab === "all" ? 600 : 400,
                  color: tab === "all" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: tab === "all" ? "var(--shadow-sm)" : "none",
                  padding: "4px 10px",
                }}
              >
                All ({hearings.length})
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTab("upcoming")}
                style={{
                  backgroundColor: tab === "upcoming" ? "var(--bg-surface)" : "transparent",
                  fontWeight: tab === "upcoming" ? 600 : 400,
                  color: tab === "upcoming" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: tab === "upcoming" ? "var(--shadow-sm)" : "none",
                  padding: "4px 10px",
                }}
              >
                Upcoming
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTab("past")}
                style={{
                  backgroundColor: tab === "past" ? "var(--bg-surface)" : "transparent",
                  fontWeight: tab === "past" ? 600 : 400,
                  color: tab === "past" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: tab === "past" ? "var(--shadow-sm)" : "none",
                  padding: "4px 10px",
                }}
              >
                Past
              </button>
            </div>

            {/* Search Input */}
            <div className="search-input-box">
              <span className="search-icon">
                <SearchIcon size={15} />
              </span>
              <input
                type="text"
                placeholder="Search matter or courtroom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
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
          </div>

          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            {filteredHearings.length} {filteredHearings.length === 1 ? "hearing" : "hearings"}
          </span>
        </div>

        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "32px 16px" }}>
              <LoadingSpinner label="Loading hearings..." />
            </div>
          ) : filteredHearings.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case Matter</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Notes</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHearings.map((h) => {
                    const d = new Date(h.hearingDate);
                    const isUpcoming = d.getTime() > now;
                    return (
                      <tr key={h._id}>
                        <td>
                          <span className="cell-bold">{h.caseId?.title || "Hearing"}</span>
                          <div className="cell-sub">
                            {h.caseId?.clientId?.name ? `Client: ${h.caseId.clientId.name}` : ""}
                          </div>
                        </td>
                        <td>
                          <span
                            className="cell-bold"
                            style={{ color: isUpcoming ? "var(--accent)" : "var(--text-primary)" }}
                          >
                            {d.toLocaleDateString("en-US", {
                              weekday: "short",
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
                        <td style={{ color: "var(--text-secondary)" }}>
                          {h.location || "Courtroom TBD"}
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            maxWidth: "240px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={h.notes}
                        >
                          {h.notes || "—"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEdit(h)}
                              title="Edit hearing"
                            >
                              <EditIcon size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteId(h._id)}
                              style={{ color: "var(--status-danger)" }}
                              title="Delete hearing"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-box">
              <p>
                {search || tab !== "all"
                  ? "No hearings match your current filter."
                  : "No hearings scheduled yet."}
              </p>
              {!search && tab === "all" && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenCreateModal}
                >
                  Schedule your first hearing
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Schedule / Edit Hearing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Hearing" : "Schedule Hearing"}
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
              form="hearing-form"
              className="btn btn-primary btn-sm"
              disabled={submitting || !form.caseId || !form.hearingDate}
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Schedule Hearing"}
            </button>
          </div>
        }
      >
        <form id="hearing-form" onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="hearing-case">
              Associated Case <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <select
              id="hearing-case"
              className="form-input"
              name="caseId"
              value={form.caseId}
              onChange={handleChange}
              required
            >
              <option value="">Select a case</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.type || "General"})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="hearing-date">
                Date & Time <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                id="hearing-date"
                className="form-input"
                name="hearingDate"
                type="datetime-local"
                value={form.hearingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hearing-loc">
                Location / Courtroom
              </label>
              <input
                id="hearing-loc"
                className="form-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Courtroom 4B or Virtual"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hearing-notes">
              Notes & Agenda
            </label>
            <textarea
              id="hearing-notes"
              className="form-input"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Motion to dismiss hearing, bring expert witness deposition..."
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Hearing"
        message="Are you sure you want to delete this hearing date? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HearingsPage;
