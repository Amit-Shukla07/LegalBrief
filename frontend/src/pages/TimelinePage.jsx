import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import TimelineList from "../components/TimelineList";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PlusIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "../components/Icons";

const TimelinePage = () => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [activity, setActivity] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cases");
      setCases(data);
      if (!selectedCaseId && data.length) {
        setSelectedCaseId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (caseId) => {
    if (!caseId) {
      setTimeline([]);
      return;
    }

    try {
      setTimelineLoading(true);
      const { data } = await api.get(`/timelines/${caseId}`);
      setTimeline(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load case timeline");
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchTimeline(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!selectedCaseId || !activity.trim()) {
      setError("Please select a case and enter the activity description");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/timelines", {
        caseId: selectedCaseId,
        activity: activity.trim(),
      });
      setActivity("");
      setSuccessMsg("Activity log entry added successfully");
      fetchTimeline(selectedCaseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to record timeline activity");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCase = cases.find((c) => c._id === selectedCaseId);

  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle="Chronological history of case filings, proceedings, and activity notes."
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

      {loading ? (
        <div style={{ padding: "32px 16px" }}>
          <LoadingSpinner label="Loading cases..." />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
          {/* Top Card: Case Selector & Add Event */}
          <div className="card">
            <div className="card-header" style={{ gap: "12px", flexWrap: "wrap" }}>
              <h2 className="card-title">Record Case Activity</h2>
              {selectedCase && (
                <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  Client: {selectedCase.clientId?.name || "Direct Client"} • Practice Area: {selectedCase.type || "General"}
                </span>
              )}
            </div>

            <div className="card-body">
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" htmlFor="timeline-case-select">
                  Select Case <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <select
                  id="timeline-case-select"
                  className="form-input"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  style={{ maxWidth: "480px" }}
                >
                  <option value="">Select a case to view timeline</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="timeline-activity">
                    New Activity Note <span style={{ color: "var(--accent)" }}>*</span>
                  </label>
                  <textarea
                    id="timeline-activity"
                    className="form-input"
                    rows="3"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="e.g. Conducted client meeting to review defense strategy; received responsive pleadings from opposing counsel..."
                    required
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting || !selectedCaseId || !activity.trim()}
                  >
                    <PlusIcon size={14} />
                    <span>{submitting ? "Adding..." : "Add Entry"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Timeline Feed Card */}
          <div className="card">
            <div className="card-header" style={{ gap: "12px", flexWrap: "wrap" }}>
              <h2 className="card-title">Activity Feed</h2>
              <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                {timeline.length} {timeline.length === 1 ? "event" : "events"} recorded
              </span>
            </div>

            <div className="card-body-flush">
              {timelineLoading ? (
                <div style={{ padding: "32px 16px" }}>
                  <LoadingSpinner label="Loading timeline logs..." />
                </div>
              ) : (
                <TimelineList items={timeline} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
