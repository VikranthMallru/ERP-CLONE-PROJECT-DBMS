import { useState, useEffect } from "react";
import API from "../services/api";

function ExamsDashboard({ userId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, [userId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/student/${userId}/exams`);
      setExams(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };

  const isExamUpcoming = (examDate) => {
    const exam = new Date(examDate);
    const today = new Date();
    return exam > today;
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  const upcomingExams = exams.filter(e => isExamUpcoming(e.date_of_exam || e.exam_date));
  const pastExams = exams.filter(e => !isExamUpcoming(e.date_of_exam || e.exam_date));

  return (
    <div className="card shadow">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-calendar-alt me-2"></i> Exam Schedule
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {exams.length === 0 ? (
          <p className="text-muted">No exams scheduled</p>
        ) : (
          <>
            {/* Upcoming Exams */}
            <div className="mb-4">
              {upcomingExams.length > 0 && (
                <>
                  <h6 className="text-success mb-3">
                    <i className="fas fa-hourglass-end me-2"></i> 
                    Upcoming Exams ({upcomingExams.length})
                  </h6>
                  <div className="table-responsive mb-4">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Course Name</th>
                          <th>Exam Date</th>
                          <th>Building</th>
                          <th>Room No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingExams.map((exam, index) => (
                          <tr key={index}>
                            <td className="text-muted">{index + 1}</td>
                            <td><strong>{exam.course_name}</strong></td>
                            <td>
                              <i className="fas fa-calendar me-2"></i>
                              {formatDate(exam.date_of_exam || exam.exam_date)}
                            </td>
                            <td>{exam.building_name}</td>
                            <td>
                              <span className="badge bg-secondary">{exam.room_number}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <small>
                      <strong>Important:</strong> Reach the exam center 15 minutes before the scheduled time. Bring your student ID and exam hall ticket.
                    </small>
                  </div>
                </>
              )}
            </div>

            {/* Past Exams */}
            {pastExams.length > 0 && (
              <div>
                <h6 className="text-muted mb-3">
                  <i className="fas fa-history me-2"></i> 
                  Past Exams ({pastExams.length})
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Course Name</th>
                        <th>Exam Date</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastExams.map((exam, index) => (
                        <tr key={index} style={{ opacity: 0.6 }}>
                          <td className="text-muted small">{index + 1}</td>
                          <td><small>{exam.course_name}</small></td>
                          <td><small>{formatDate(exam.date_of_exam || exam.exam_date)}</small></td>
                          <td><small>{exam.room_number}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExamsDashboard;
