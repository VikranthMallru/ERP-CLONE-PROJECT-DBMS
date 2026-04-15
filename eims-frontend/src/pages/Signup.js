import { useState } from "react";
import API from "../services/api";

function Signup() {
  const [role, setRole] = useState("");
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Student profile fields
  const [studentData, setStudentData] = useState({
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

  // Faculty profile fields
  const [facultyData, setFacultyData] = useState({
    faculty_name: "",
    contact_no: "",
    email: "",
    department_id: ""
  });

  const validatePassword = (pwd) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    return hasUppercase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const handleStudentDataChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacultyDataChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!role) {
      setError("Please select a role");
      return;
    }

    if (!user_id || !password || !confirmPassword) {
      setError("Please fill in all authentication fields");
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

    // Role-specific validation
    if (role === "Student" && !studentData.student_name) {
      setError("Please enter your name");
      return;
    }

    if (role === "Faculty" && !facultyData.faculty_name) {
      setError("Please enter your name");
      return;
    }

    if (role === "Admin" && role) {
      // Admin just needs credentials
    }

    setLoading(true);

    try {
      let payload = {
        user_id,
        password,
        role
      };

      if (role === "Student") {
        payload = { ...payload, ...studentData };
      } else if (role === "Faculty") {
        payload = { ...payload, ...facultyData };
      }

      const res = await API.post("/signup", payload);

      setSuccess(res.data.message || "Signup successful! Please login with your credentials.");
      
      // Clear form
      setRole("");
      setUserId("");
      setPassword("");
      setConfirmPassword("");
      setStudentData({
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
      setFacultyData({
        faculty_name: "",
        contact_no: "",
        email: "",
        department_id: ""
      });

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (!role) return null;

    if (role === "Student") {
      return (
        <div className="role-fields">
          <h6 className="mb-3 text-primary">Student Information</h6>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="student_name"
                placeholder="Your full name"
                value={studentData.student_name}
                onChange={handleStudentDataChange}
                disabled={loading}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                className="form-control"
                name="contact_no"
                placeholder="10-digit mobile number"
                value={studentData.contact_no}
                onChange={handleStudentDataChange}
                disabled={loading}
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
                placeholder="college@email.com"
                value={studentData.college_email}
                onChange={handleStudentDataChange}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Personal Email</label>
              <input
                type="email"
                className="form-control"
                name="personal_email"
                placeholder="personal@email.com"
                value={studentData.personal_email}
                onChange={handleStudentDataChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Semester</label>
              <input
                type="number"
                className="form-control"
                name="semester"
                placeholder="1"
                value={studentData.semester}
                onChange={handleStudentDataChange}
                disabled={loading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Department ID</label>
              <input
                type="text"
                className="form-control"
                name="department_id"
                placeholder="CS, IT, etc."
                value={studentData.department_id}
                onChange={handleStudentDataChange}
                disabled={loading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Discipline ID</label>
              <input
                type="text"
                className="form-control"
                name="discipline_id"
                placeholder="Discipline"
                value={studentData.discipline_id}
                onChange={handleStudentDataChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Residence Address</label>
            <textarea
              className="form-control"
              name="residence_address"
              placeholder="Your address"
              value={studentData.residence_address}
              onChange={handleStudentDataChange}
              disabled={loading}
              rows="2"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Join Date</label>
            <input
              type="date"
              className="form-control"
              name="join_date"
              value={studentData.join_date}
              onChange={handleStudentDataChange}
              disabled={loading}
            />
          </div>
        </div>
      );
    } else if (role === "Faculty") {
      return (
        <div className="role-fields">
          <h6 className="mb-3 text-primary">Faculty Information</h6>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="faculty_name"
                placeholder="Your full name"
                value={facultyData.faculty_name}
                onChange={handleFacultyDataChange}
                disabled={loading}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                className="form-control"
                name="contact_no"
                placeholder="10-digit mobile number"
                value={facultyData.contact_no}
                onChange={handleFacultyDataChange}
                disabled={loading}
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
                placeholder="faculty@email.com"
                value={facultyData.email}
                onChange={handleFacultyDataChange}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department ID</label>
              <input
                type="text"
                className="form-control"
                name="department_id"
                placeholder="CS, IT, etc."
                value={facultyData.department_id}
                onChange={handleFacultyDataChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Create New Account</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-4">Please fill in all required fields to create your account</p>

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

        <form onSubmit={handleSignup}>
          {/* Role Selection */}
          <div className="mb-4">
            <label className="form-label fw-bold">Choose Your Role *</label>
            <div className="btn-group w-100" role="group">
              <input 
                type="radio" 
                className="btn-check" 
                name="role" 
                id="roleStudent" 
                value="Student"
                checked={role === "Student"}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <label className="btn btn-outline-primary" htmlFor="roleStudent">
                👨‍🎓 Student
              </label>

              <input 
                type="radio" 
                className="btn-check" 
                name="role" 
                id="roleFaculty" 
                value="Faculty"
                checked={role === "Faculty"}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <label className="btn btn-outline-primary" htmlFor="roleFaculty">
                👨‍🏫 Faculty
              </label>

              <input 
                type="radio" 
                className="btn-check" 
                name="role" 
                id="roleAdmin" 
                value="Admin"
                checked={role === "Admin"}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <label className="btn btn-outline-primary" htmlFor="roleAdmin">
                ⚙️ Admin
              </label>
            </div>
          </div>

          <hr />

          {/* Authentication Fields */}
          <div className="auth-section mb-4">
            <h6 className="mb-3 text-primary">Authentication Details</h6>
            
            <div className="mb-3">
              <label className="form-label">User ID / Roll No / Faculty ID *</label>
              <input
                className="form-control"
                placeholder={role === "Student" ? "Enter your roll number" : role === "Faculty" ? "Enter your faculty ID" : "Enter your user ID"}
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <small className="form-text text-muted d-block mb-3">
              <strong>Password requirements:</strong>
              <ul className="mb-0 ps-3">
                <li>Minimum 8 characters</li>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 number</li>
                <li>At least 1 special character (!@#$%^&* etc)</li>
              </ul>
            </small>
          </div>

          <hr />

          {/* Role-specific Fields */}
          {renderRoleFields()}

          <button 
            type="submit" 
            className="btn btn-success w-100 mt-3"
            disabled={loading || !role}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
