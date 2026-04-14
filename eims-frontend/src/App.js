import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  if (isLoggedIn) {
    const role = localStorage.getItem("role");
    if (role === "Admin") {
      return <AdminDashboard />;
    }
    if (role === "Faculty") {
      return <FacultyDashboard />;
    }
    return <Dashboard />;
  }

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <div className="row">

          {/* LEFT SIDE */}
          <div className="col-md-6">
            <div className="card shadow p-3">

              <div className="mb-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setActiveTab("login")}
                >
                  Sign In
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>

              {activeTab === "login" ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
              ) : (
                <Signup />
              )}

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Important</h5>
              <ul>
                <li>Profile edit/update Procedure</li>
                <li>ERP System Instructions</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;