import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './LeaveApprovals.css';

const CourseApprovals = () => {
  const [courseRegistrations, setCourseRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchCourseRegistrations();
  }, []);

  const fetchCourseRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch pending courses for all students under this faculty
      const pendingStudents = await api.get(`/faculty/pending/${facultyId}`);
      console.log('Pending students:', pendingStudents.data);
      
      // For each student, fetch their pending courses
      const allCourses = [];
      for (const student of pendingStudents.data) {
        try {
          const coursesRes = await api.get(`/faculty/student-courses/${student.student_id}`);
          allCourses.push(...coursesRes.data.map(course => ({
            ...course,
            student_id: student.student_id,
            student_name: student.student_name
          })));
        } catch (err) {
          console.error(`Failed to fetch courses for student ${student.student_id}:`, err);
        }
      }
      
      console.log('All course registrations:', allCourses);
      setCourseRegistrations(allCourses);
    } catch (err) {
      setError('Failed to fetch course registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseApproval = async (studentId, courseOfferingId) => {
    try {
      setLoading(true);
      console.log('Approving course:', { studentId, courseOfferingId });
      
      const response = await api.post('/faculty/approve', {
        student_id: studentId,
        course_offering_id: courseOfferingId
      });
      
      console.log('Approval response:', response.data);
      setSuccessMessage('Course approved successfully!');
      
      // Refresh the course registrations list
      await fetchCourseRegistrations();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to approve course');
      console.error('Approval error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-approvals">
      <h3 className="section-title">
        <i className="bi bi-book"></i> Pending Registration Approvals
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="stats-section mb-4">
        <div className="row g-2">
          <div className="col-md-12">
            <div className="stat-card stat-pending">
              <h6>Total Pending</h6>
              <h4>{courseRegistrations.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {loading && !courseRegistrations.length ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : courseRegistrations.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Course Code</th>
                <th>Faculty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseRegistrations.map((course) => (
                <tr key={`${course.student_id}-${course.course_offering_id}`}>
                  <td>
                    <span className="badge bg-info">{course.student_id}</span>
                  </td>
                  <td>{course.student_name}</td>
                  <td>{course.course_name}</td>
                  <td>{course.course_id}</td>
                  <td>{course.faculty_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleCourseApproval(course.student_id, course.course_offering_id)}
                      disabled={loading}
                      title="Approve Course"
                    >
                      <i className="bi bi-check"></i> Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle"></i> No pending registrations
        </div>
      )}

      <div className="mt-4">
        <p className="text-muted">Total Pending: {courseRegistrations.length}</p>
      </div>
    </div>
  );
};

export default CourseApprovals;
