import { useEffect, useState, useRef } from "react";
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
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isFirstRun = useRef(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/clients", {
        params: search.trim() ? { keyword: search.trim() } : {},
      });
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load client records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      fetchClients();
      return;
    }
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleOpenCreateModal = () => {
    setEditingId("");
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setForm({
      name: client.name || "",
      email: client.contactInfo?.email || "",
      phone: client.contactInfo?.phone || "",
      address: client.address || "",
      notes: client.notes || "",
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
        await api.put(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }

      setIsModalOpen(false);
      setForm(emptyForm);
      setEditingId("");
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save client record");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/clients/${deleteId}`);
      setDeleteId(null);
      if (editingId === deleteId) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete client record");
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Manage your client directory and contact details."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            <PlusIcon size={14} />
            <span>Add Client</span>
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
          <div className="search-input-box">
            <span className="search-icon">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or notes..."
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
          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </span>
        </div>

        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "32px 16px" }}>
              <LoadingSpinner label="Loading clients..." />
            </div>
          ) : clients.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <span className="cell-bold">{client.name}</span>
                        {client.notes && (
                          <div
                            className="cell-sub"
                            style={{
                              maxWidth: "260px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={client.notes}
                          >
                            {client.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ color: "var(--text-primary)" }}>
                        {client.contactInfo?.email || "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {client.contactInfo?.phone || "—"}
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          maxWidth: "240px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={client.address}
                      >
                        {client.address || "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(client)}
                            title="Edit client"
                          >
                            <EditIcon size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteId(client._id)}
                            style={{ color: "var(--status-danger)" }}
                            title="Delete client"
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
              <p>{search ? "No clients match your search query." : "No clients added yet."}</p>
              {!search && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenCreateModal}
                >
                  Add your first client
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Client" : "Add Client"}
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
              form="client-form"
              className="btn btn-primary btn-sm"
              disabled={submitting || !form.name.trim()}
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Client"}
            </button>
          </div>
        }
      >
        <form id="client-form" onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="client-name">
              Full Name <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              id="client-name"
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation or Jane Doe"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="client-email">
                Email
              </label>
              <input
                id="client-email"
                className="form-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="client@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="client-phone">
                Phone
              </label>
              <input
                id="client-phone"
                className="form-input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 012-3456"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-address">
              Address
            </label>
            <input
              id="client-address"
              className="form-input"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Market St, Suite 400"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-notes">
              Notes
            </label>
            <textarea
              id="client-notes"
              className="form-input"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional notes regarding client relationship or representation..."
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Client"
        message="Are you sure you want to delete this client? Cases associated with this client will remain in the system."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ClientsPage;
