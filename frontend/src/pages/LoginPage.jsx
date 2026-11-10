import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ScaleIcon } from "../components/Icons";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setForm((curr) => ({ ...curr, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
          <h1 className="auth-hero-title">Legal work, organized.</h1>
          <p className="auth-hero-desc">
            Manage clients, cases, documents, and hearings in one place.
          </p>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-inverse-muted)" }}>
          Legal case management system
        </div>
      </section>

      {/* Right Pane */}
      <section className="auth-right-container">
        <div className="auth-box">
          <h2 className="auth-heading">Sign in</h2>
          <p className="auth-subheading">
            Enter your email and password to access your account.
          </p>

          {error && <div className="alert-banner alert-banner-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
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
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  className="form-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: "100%", marginTop: "6px" }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--accent)", fontWeight: 500 }}>
              Register
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
