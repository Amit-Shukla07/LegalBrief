import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ScaleIcon } from "../components/Icons";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Lawyer",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((curr) => ({ ...curr, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your information.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Pane */}
      <section className="auth-left-hero">
        <div className="auth-brand-row">
          <div className="auth-brand-logo">
            <ScaleIcon size={18} />
          </div>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 700 }}>
            LegalBrief
          </span>
        </div>

        <div className="auth-left-content">
          <h1 className="auth-hero-title">Create your workspace.</h1>
          <p className="auth-hero-desc">
            Organize clients, cases, documents, and court proceedings with ease.
          </p>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-inverse-muted)" }}>
          Legal case management system
        </div>
      </section>

      {/* Right Pane */}
      <section className="auth-right-container">
        <div className="auth-box">
          <h2 className="auth-heading">Create account</h2>
          <p className="auth-subheading">
            Register to get started with LegalBrief.
          </p>

          {error && <div className="alert-banner alert-banner-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full name
              </label>
              <input
                id="reg-name"
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Eleanor Vance"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                className="form-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="reg-password"
                  className="form-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  style={{ paddingRight: "50px" }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                Role
              </label>
              <select
                id="reg-role"
                className="form-input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Lawyer">Lawyer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: "100%", marginTop: "6px" }}
            >
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
