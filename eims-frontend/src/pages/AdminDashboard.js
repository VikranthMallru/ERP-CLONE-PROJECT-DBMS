import { useState, useEffect } from "react";
import AdminSQLConsole from "../components/AdminSQLConsole";

function AdminDashboard() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    
    if (!storedUserId || role !== "Admin") {
      window.location.href = "/";
      return;
    }
    
    setUserId(storedUserId);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-shield-alt me-2"></i>EIMS - Admin Dashboard
          </span>
          <div className="d-flex">
            <span className="text-white me-3">
              <i className="fas fa-user-circle me-2"></i>Admin: {userId}
            </span>
            <button className="btn btn-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4 mb-5">
        <div className="row">
          <div className="col-12">
            {/* Admin Info Card */}
            <div
              className="alert alert-info border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <h5 className="mb-2">
                <i className="fas fa-shield-alt me-2"></i>Admin Control Panel
              </h5>
              <p className="mb-0">
                This dashboard provides administrative tools for system management and monitoring.
                All queries and actions are logged for security and compliance purposes.
              </p>
            </div>

            {/* SQL Console Section */}
            <div className="mt-4">
              <AdminSQLConsole />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light py-4 mt-5 border-top">
        <div className="container text-center">
          <small className="text-muted">
            <i className="fas fa-lock me-2"></i>All admin activities are monitored and logged
          </small>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;
