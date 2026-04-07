import { useState, useEffect } from "react";
import API from "../services/api";

function StudentProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    student_name: "",
    contact_no: "",
    college_email: "",
    personal_email: "",
    residence_address: "",
    join_date: "",
    semester: "",
    department_id: "",
    discipline_id: ""
  });

  // Helper function to format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not provided";
    // Extract just the date part, avoiding timezone conversions
    const datePart = dateString.split('T')[0]; // YYYY-MM-DD
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.split('T')[0];
  };

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
      const res = await API.get(`/student/profile/${userId}`);
      setProfile(res.data);
      
      setFormData({
        student_name: res.data.student_name || "",
        contact_no: res.data.contact_no || "",
        college_email: res.data.college_email || "",
        personal_email: res.data.personal_email || "",
        residence_address: res.data.residence_address || "",
        join_date: formatDateForInput(res.data.join_date),
        semester: res.data.semester || "",
        department_id: res.data.department_id || "",
        discipline_id: res.data.discipline_id || ""
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
      const res = await API.post("/student/profile", {
        student_id: userId,
        ...formData,
        // Ensure join_date stays in YYYY-MM-DD format
        join_date: formData.join_date || null
      });
      setSuccess("Profile updated successfully!");
      // Update profile with the exact date that was sent to avoid timezone issues
      setProfile({ 
        ...profile, 
        ...formData,
        join_date: formData.join_date ? `${formData.join_date}T00:00:00` : null
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Student Profile</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}
        {success && <div className="alert alert-success alert-dismissible fade show">{success}</div>}

        {!isEditing ? (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <p><strong>Student ID:</strong> {userId}</p>
                <p><strong>Name:</strong> {profile?.student_name || "Not provided"}</p>
                <p><strong>Email:</strong> {profile?.college_email || "Not provided"}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Contact:</strong> {profile?.contact_no || "Not provided"}</p>
                <p><strong>Semester:</strong> {profile?.semester || "Not provided"}</p>
                <p><strong>Department:</strong> {profile?.department_id || "Not provided"}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <p><strong>Joined:</strong> {formatDateForDisplay(profile?.join_date)}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Discipline:</strong> {profile?.discipline_id || "Not provided"}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-12">
                <p><strong>Address:</strong> {profile?.residence_address || "Not provided"}</p>
              </div>
            </div>
            <button 
              className="btn btn-warning"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
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
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleInputChange}
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
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="college_email"
                  value={formData.college_email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Personal Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="personal_email"
                  value={formData.personal_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Semester</label>
                <input
                  type="text"
                  className="form-control"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
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
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Discipline ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="discipline_id"
                  value={formData.discipline_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Join Date (Format: DD/MM/YYYY)</label>
                <input
                  type="date"
                  className="form-control"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                />
                <small className="form-text text-muted">Selected: {formatDateForDisplay(formData.join_date)}</small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                name="residence_address"
                rows="3"
                value={formData.residence_address}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-success me-2">Save Changes</button>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    student_name: profile?.student_name || "",
                    contact_no: profile?.contact_no || "",
                    college_email: profile?.college_email || "",
                    personal_email: profile?.personal_email || "",
                    residence_address: profile?.residence_address || "",
                    join_date: formatDateForInput(profile?.join_date),
                    semester: profile?.semester || "",
                    department_id: profile?.department_id || "",
                    discipline_id: profile?.discipline_id || ""
                  });
                }}
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

export default StudentProfile;
