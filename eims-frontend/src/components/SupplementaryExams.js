import { useState, useEffect } from "react";
import API from "../services/api";

function SupplementaryExams({ userId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [appliedExams, setAppliedExams] = useState({});

  useEffect(() => {
    fetchSupplementaryExams();
  }, [userId]);

  const fetchSupplementaryExams = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/student/${userId}/supplementary-exams`);
      setExams(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load supplementary exams");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyExam = async (courseOfferingId) => {
    try {
      setAppliedExams(prev => ({ ...prev, [courseOfferingId]: true }));
      setSuccess("Applied successfully! Please pay the exam fee at the Main Building counter.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("Failed to apply for exam");
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          <i className="fas fa-book-open me-2"></i> Supplementary Exams
        </h5>
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

        {exams.length === 0 ? (
          <div className="alert alert-success" role="alert">
            <i className="fas fa-check-circle me-2"></i> Great! You have no supplementary exams available.
          </div>
        ) : (
          <>
            <div className="alert alert-warning" role="alert">
              <strong>Note:</strong> You are eligible for <strong>{exams.length}</strong> supplementary exam(s)
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th width="40%">Course Name</th>
                    <th width="15%">Exam Fee</th>
                    <th width="20%">Status</th>
                    <th width="25%">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, index) => (
                    <tr key={index} style={{ borderLeft: exam.price ? "4px solid #ffc107" : "4px solid transparent" }}>
                      <td>
                        <strong>{exam.course_name}</strong>
                        <br />
                        <small className="text-muted">ID: {exam.course_offering_id}</small>
                      </td>
                      <td>
                        <span className="badge bg-success fs-6">₹{exam.price}</span>
                      </td>
                      <td>
                        {appliedExams[exam.course_offering_id] ? (
                          <span className="badge bg-info">Applied</span>
                        ) : (
                          <span className="badge bg-secondary">Not Applied</span>
                        )}
                      </td>
                      <td>
                        {!appliedExams[exam.course_offering_id] ? (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleApplyExam(exam.course_offering_id)}
                          >
                            <i className="fas fa-check me-1"></i> Apply
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-success"
                            disabled
                          >
                            <i className="fas fa-check-circle me-1"></i> Applied
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <small>
                <strong>Process:</strong> Click "Apply" to register for an exam, then "Pay Now" to complete payment through the bank portal. After successful payment, your registration will be confirmed.
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SupplementaryExams;
