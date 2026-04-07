import { useState, useEffect } from "react";
import API from "../services/api";

function Backlogs({ userId }) {
  const [backlogs, setBacklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBacklogs();
  }, [userId]);

  const fetchBacklogs = async () => {
    try {
      setLoading(true);
      // Fetch supplementary exams as they indicate backlog courses
      const res = await API.get(`/student/${userId}/supplementary-exams`).catch(() => ({ data: [] }));
      setBacklogs(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load backlogs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">
          <i className="fas fa-exclamation-circle me-2"></i> Backlog Courses
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {backlogs.length === 0 ? (
          <div className="alert alert-success" role="alert">
            <i className="fas fa-check-circle me-2"></i> Excellent! You have no backlog courses.
          </div>
        ) : (
          <>
            <div className="alert alert-danger" role="alert">
              <strong>Alert:</strong> You have {backlogs.length} backlog course(s) that require retakes.
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {backlogs.map((course, index) => (
                    <tr key={index} style={{ borderLeft: "4px solid #dc3545" }}>
                      <td className="text-muted">{index + 1}</td>
                      <td><strong>{course.course_name}</strong></td>
                      <td><span className="badge bg-danger">Failed (F)</span></td>
                      <td>
                        <small className="text-muted">Register for retake in Course Registrations</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <small>
                These courses are marked as backlog. You can register for them again in <strong>Course Registrations</strong>. They will appear with a red border indicating backlog status.
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Backlogs;
