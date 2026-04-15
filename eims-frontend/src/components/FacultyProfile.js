import { useState, useEffect } from "react";
import API from "../services/api";

function FacultyProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    faculty_name: "",
    contact_no: "",
    email: "",
    department_id: ""
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/faculty/profile/${userId}`);
      setProfile(res.data);
      
      setFormData({
        faculty_name: res.data.faculty_name || "",
        contact_no: res.data.contact_no || "",
        email: res.data.email || "",
        department_id: res.data.department_id || ""
      });
      setError("");
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        faculty_id: userId,
        ...formData
      };
      console.log("Sending faculty profile update:", payload);
      
      const res = await API.post("/faculty/profile", payload);
      
      console.log("Faculty profile update response:", res.data);
      setSuccess("Profile updated successfully!");
      setProfile({ 
        ...profile, 
        ...formData
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Faculty profile update error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">👨‍🏫 Faculty Profile</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
          </div>
        )}

        {!isEditing ? (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Faculty ID:</strong> <span className="text-muted">{userId}</span>
                </p>
                <p className="mb-2">
                  <strong>Name:</strong> <span className="text-muted">{profile?.faculty_name || "Not provided"}</span>
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> <span className="text-muted">{profile?.email || "Not provided"}</span>
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Contact:</strong> <span className="text-muted">{profile?.contact_no || "Not provided"}</span>
                </p>
                <p className="mb-2">
                  <strong>Department:</strong> <span className="text-muted">{profile?.department_id || "Not provided"}</span>
                </p>
              </div>
            </div>

            <button 
              className="btn btn-warning mt-3"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="faculty_name"
                  value={formData.faculty_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="faculty@email.com"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Department ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  placeholder="CS, IT, EC, etc."
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                💾 Save Changes
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FacultyProfile;
