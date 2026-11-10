import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  UploadCloudIcon,
  FileIcon,
  ExternalLinkIcon,
  TrashIcon,
  CloseIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "../components/Icons";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const serverBaseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

  const fetchCases = async () => {
    try {
      const { data } = await api.get("/cases");
      setCases(data);
      if (!caseId && data.length) {
        setCaseId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchDocuments = async (selectedCaseId) => {
    try {
      setLoading(true);
      const { data } = await api.get("/documents", {
        params: selectedCaseId ? { caseId: selectedCaseId } : {},
      });
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (caseId) {
      fetchDocuments(caseId);
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [caseId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!caseId || !file) {
      setError("Please select a case and choose a file to upload");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds the 10 MB limit");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("file", file);

    try {
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMsg("Document uploaded successfully");
      fetchDocuments(caseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/documents/${deleteId}`);
      setDeleteId(null);
      fetchDocuments(caseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete document");
      setDeleteId(null);
    }
  };

  const selectedCase = cases.find((c) => c._id === caseId);

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Upload and manage evidentiary records, exhibits, and court filings."
      />

      {error && (
        <div className="alert-banner alert-banner-error" style={{ marginBottom: "16px" }}>
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-banner alert-banner-success" style={{ marginBottom: "16px" }}>
          <CheckCircleIcon size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        {/* Upload Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upload Document</h2>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Max size: 10 MB • PDF, PNG, JPG, DOC, DOCX, TXT
            </span>
          </div>

          <div className="card-body">
            <form onSubmit={handleUpload} className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="doc-case-select">
                  Associated Case <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <select
                  id="doc-case-select"
                  className="form-input"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  style={{ maxWidth: "480px" }}
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

              {/* Drag and Drop Zone */}
              <div
                className={`dropzone-box ${isDragging ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "1.5px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: isDragging ? "var(--accent-subtle)" : "var(--bg-app)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div style={{ color: "var(--accent)", marginBottom: "8px" }}>
                  <UploadCloudIcon size={24} />
                </div>
                <p style={{ margin: "0 0 4px 0", fontSize: "13.5px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {file ? file.name : "Drag and drop file here, or click to browse"}
                </p>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Files will be linked to the selected case"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                {file && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFile(null)}
                  >
                    Clear selection
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={uploading || !caseId || !file}
                >
                  <UploadCloudIcon size={14} />
                  <span>{uploading ? "Uploading..." : "Upload Document"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Document List Card */}
        <div className="card">
          <div className="card-header" style={{ gap: "12px", flexWrap: "wrap" }}>
            <h2 className="card-title">
              {selectedCase ? `Documents for "${selectedCase.title}"` : "Documents"}
            </h2>
            <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </span>
          </div>

          <div className="card-body-flush">
            {loading ? (
              <div style={{ padding: "32px 16px" }}>
                <LoadingSpinner label="Loading documents..." />
              </div>
            ) : documents.length ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Case</th>
                      <th>Uploaded Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const fileHref = doc.filePath?.startsWith("http")
                        ? doc.filePath
                        : `${serverBaseUrl}/${doc.filePath?.replace(/\\/g, "/")}`;

                      return (
                        <tr key={doc._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FileIcon size={15} />
                              <span className="cell-bold">{doc.filename}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>
                            {doc.caseId?.title || selectedCase?.title || "Associated Case"}
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
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <a
                                href={fileHref}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                title="Open file"
                              >
                                <span>Open</span>
                                <ExternalLinkIcon size={12} />
                              </a>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDeleteId(doc._id)}
                                style={{ color: "var(--status-danger)" }}
                                title="Delete document"
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
                  {caseId
                    ? "No documents uploaded for this case yet."
                    : "Select a case above to view documents."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DocumentsPage;
