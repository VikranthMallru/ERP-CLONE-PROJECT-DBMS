import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdvisoryStudents.css';

const AdvisoryStudents = () => {
  const [advisoryStudents, setAdvisoryStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchAdvisoryStudents();
  }, []);

  const fetchAdvisoryStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/${facultyId}/advisory-students`);
      setAdvisoryStudents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch advisory students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (studentId) => {
    try {
      setDetailsLoading(true);
      // This would typically fetch more detailed info about the student
      const response = await api.get(`/student/${studentId}`);
      setStudentDetails(response.data);
      setSelectedStudent(studentId);
    } catch (err) {
      setError('Failed to fetch student details');
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getAcademicStatus = (cgpa) => {
    if (cgpa >= 3.5) return { label: 'Excellent', color: 'success' };
    if (cgpa >= 3.0) return { label: 'Good', color: 'info' };
    if (cgpa >= 2.5) return { label: 'Average', color: 'warning' };
    return { label: 'Poor', color: 'danger' };
  };

  return (
    <div className="advisory-students">
      <h3 className="section-title">
        <i className="bi bi-person-check"></i> Advisory Students
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="advisory-container">
        <div className="students-list">
          <h5>Your Advisees</h5>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : advisoryStudents.length > 0 ? (
            <div className="list-group">
              {advisoryStudents.map((student) => (
                <div
                  key={student.student_id}
                  className={`list-group-item list-group-item-action cursor-pointer ${
                    selectedStudent === student.student_id ? 'active' : ''
                  }`}
                  onClick={() => viewStudentDetails(student.student_id)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <div>
                      <h6 className="mb-1">{student.name}</h6>
                      <small className="text-muted">ID: {student.student_id}</small>
                    </div>
                    <span
                      className={`badge bg-${getAcademicStatus(student.cgpa).color}`}
                      title="Academic Status"
                    >
                      CGPA: {student.cgpa?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No advisory students assigned</p>
          )}
        </div>

        <div className="student-details">
          {selectedStudent ? (
            detailsLoading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : studentDetails ? (
              <>
                <div className="details-header mb-4">
                  <h5>{studentDetails.name}</h5>
                  <p className="text-muted">Student ID: {studentDetails.student_id}</p>
                </div>

                <div className="details-cards">
                  <div className="detail-card">
                    <strong>Email</strong>
                    <p>{studentDetails.email}</p>
                  </div>

                  <div className="detail-card">
                    <strong>Student Number</strong>
                    <p>{studentDetails.student_number || 'N/A'}</p>
                  </div>

                  <div className="detail-card">
                    <strong>Department</strong>
                    <p>{studentDetails.department || 'N/A'}</p>
                  </div>

                  <div className="detail-card">
                    <strong>CGPA</strong>
                    <p>
                      <span
                        className={`badge bg-${
                          studentDetails.cgpa ? getAcademicStatus(studentDetails.cgpa).color : 'secondary'
                        }`}
                      >
                        {studentDetails.cgpa?.toFixed(2) || 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="detail-card">
                    <strong>Current Semester</strong>
                    <p>{studentDetails.current_semester || 'N/A'}</p>
                  </div>

                  <div className="detail-card">
                    <strong>Status</strong>
                    <p>
                      <span className="badge bg-success">Active</span>
                    </p>
                  </div>
                </div>

                <div className="action-buttons mt-4">
                  <button className="btn btn-primary btn-sm">
                    <i className="bi bi-envelope"></i> Send Message
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <i className="bi bi-calendar-event"></i> Schedule Meeting
                  </button>
                  <button className="btn btn-info btn-sm">
                    <i className="bi bi-graph-up"></i> View Academic Progress
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="text-muted">Failed to load student details</p>
              </div>
            )
          ) : (
            <div className="empty-state">
              <p className="text-muted">Select a student to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisoryStudents;
