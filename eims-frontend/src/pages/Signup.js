import { useState } from "react";
import API from "../services/api";

function Signup() {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (pwd) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    return hasUppercase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!user_id || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters and contain uppercase letter, number, and special character");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/signup", {
        user_id,
        password,
        role
      });

      setSuccess(res.data.message);
      
      // Clear form
      setUserId("");
      setPassword("");
      setConfirmPassword("");
      setRole("Student");

      // Optional: Redirect to login after success
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-4">Sign Up</h5>
      <p className="text-muted">Create a new account</p>

      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError("")}></button>
      </div>}

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
      </div>}

      <form onSubmit={handleSignup}>
        <input
          className="form-control mb-3"
          placeholder="User ID (Roll No / Faculty ID)"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        <small className="form-text text-muted d-block mb-3">
          Password requirements:
          <ul className="mb-2">
            <li>Minimum 8 characters</li>
            <li>At least 1 uppercase letter</li>
            <li>At least 1 number</li>
            <li>At least 1 special character (!@#$%^&* etc)</li>
          </ul>
        </small>

        <select
          className="form-control mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Admin">Admin</option>
        </select>

        <button 
          type="submit" 
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
