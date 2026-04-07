import { useState } from "react";
import API from "../services/api";

function Login({ onLoginSuccess }) {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user_id || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/login", {
        user_id,
        password
      });

      setSuccess(res.data.message);
      // Store user data in localStorage
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("token", res.data.token || "");

      // Clear form
      setUserId("");
      setPassword("");
      setShowPassword(false);

      // Call the callback to update login state
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 500);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-4">Sign In</h5>
      <p className="text-muted">Please provide login details</p>

      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError("")}></button>
      </div>}

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
      </div>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Username / Roll No / Faculty ID</label>
          <input
            className="form-control"
            placeholder="Enter your ID"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <i className={`fas fa-eye${!showPassword ? "-slash" : ""}`}></i>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;