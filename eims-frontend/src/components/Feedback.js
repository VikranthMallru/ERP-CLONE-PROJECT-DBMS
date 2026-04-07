import { useState, useEffect } from "react";
import API from "../services/api";

function Feedback({ userId }) {
  const [feedbackCourses, setFeedbackCourses] = useState([]);
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeTab, setActiveTab] = useState("submit");

  useEffect(() => {
    fetchFeedbackData();
  }, [userId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [coursesRes, submittedRes] = await Promise.all([
        API.get(`/student/${userId}/feedback-courses`),
        API.get(`/student/${userId}/submitted-feedback`).catch(() => ({ data: [] }))
      ]);
      
      setFeedbackCourses(coursesRes.data);
      setSubmittedFeedback(submittedRes.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load feedback data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedCourse || !feedbackText.trim()) {
      setError("Please select a course and enter feedback");
      return;
    }

    try {
      await API.post("/student/submit-feedback", {
        student_id: userId,
        course_offering_id: selectedCourse.course_offering_id,
        feedback: feedbackText
      });

      setSuccess("Feedback submitted successfully!");
      setFeedbackText("");
      setSelectedCourse(null);
      setTimeout(() => setSuccess(""), 3000);
      fetchFeedbackData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Course Feedback</h5>
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
            ✓ {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "submit" ? "active" : ""}`}
              onClick={() => setActiveTab("submit")}
              type="button"
            >
              Submit Feedback
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "submitted" ? "active" : ""}`}
              onClick={() => setActiveTab("submitted")}
              type="button"
            >
              Submitted Feedback
            </button>
          </li>
        </ul>

        {/* Submit Feedback Tab */}
        {activeTab === "submit" && (
          <div>
            <h6 className="mb-3">Select a course to provide feedback</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Select Course:</label>
                <select 
                  className="form-select"
                  value={selectedCourse ? selectedCourse.course_offering_id : ""}
                  onChange={(e) => {
                    const course = feedbackCourses.find(c => c.course_offering_id == e.target.value);
                    setSelectedCourse(course);
                  }}
                >
                  <option value="">-- Choose a course --</option>
                  {feedbackCourses.map(course => (
                    <option key={course.course_offering_id} value={course.course_offering_id}>
                      {course.course_name} - {course.faculty_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCourse && (
              <div className="mb-3">
                <label className="form-label">Your Feedback:</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Please provide your feedback about the course and instructor..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                ></textarea>
                <small className="text-muted">Minimum 10 characters required</small>
              </div>
            )}

            <button 
              className="btn btn-primary"
              onClick={handleSubmitFeedback}
              disabled={!selectedCourse || !feedbackText.trim()}
            >
              Submit Feedback
            </button>
          </div>
        )}

        {/* Submitted Feedback Tab */}
        {activeTab === "submitted" && (
          <div>
            {submittedFeedback.length === 0 ? (
              <p className="text-muted">No submitted feedback yet</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Course Name</th>
                      <th>Faculty</th>
                      <th>Your Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedFeedback.map((feedback, index) => (
                      <tr key={index}>
                        <td>{feedback.course_name}</td>
                        <td>{feedback.faculty_name}</td>
                        <td>
                          <small className="text-break">{feedback.feedback}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
