import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './RegistrationApprovals.css';

const RegistrationApprovals = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentCourses, setSelectedStudentCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [approvingStudent, setApprovingStudent] = useState(null);
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/faculty/pending/${facultyId}`);
      console.log('Pending students:', response.data);
      setPendingStudents(response.data);
      setSelectedStudent(null);
      setSelectedStudentCourses([]);
    } catch (err) {
      setError('Failed to fetch pending students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCourses = async (studentId) => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/student-courses/${studentId}`);
      console.log(`Courses for student ${studentId}:`, response.data);
      setSelectedStudent(studentId);
      setSelectedStudentCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch student courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAllCourses = async () => {
    try {
      setApprovingStudent(selectedStudent);
      console.log('Approving all courses for student:', selectedStudent);

      const approvalPromises = selectedStudentCourses.map((course) =>
        api.post('/faculty/approve', {
          student_id: selectedStudent,
          course_offering_id: course.course_offering_id
        })
      );

      await Promise.all(approvalPromises);
      console.log('All approvals completed');
      
      setSuccessMessage(`All ${selectedStudentCourses.length} courses approved successfully!`);

      // Refresh pending students list and clear selection
      await fetchPendingStudents();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to approve courses');
      console.error('Approval error:', err);
    } finally {
      setApprovingStudent(null);
    }
  };

  const getStudentName = (studentId) => {
    const student = pendingStudents.find(s => s.student_id === studentId);
    return student ? student.student_name : studentId;
  };

  return (
    <div className="registration-approvals">
      <h3 className="section-title">
        <i className="bi bi-check-circle"></i> Registration Approvals
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="approval-layout">
        {/* Students List Sidebar */}
        <div className="students-sidebar">
          <h5 className="sidebar-title">Students with Pending Courses</h5>
          
          {loading && !pendingStudents.length ? (
            <div className="loading-spinner">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading students...</span>
            </div>
          ) : pendingStudents.length > 0 ? (
            <div className="students-list">
              {pendingStudents.map((student) => (
                <div
                  key={student.student_id}
                  className={`student-item ${selectedStudent === student.student_id ? 'active' : ''}`}
                  onClick={() => fetchStudentCourses(student.student_id)}
                >
                  <div className="student-badge">{student.student_id}</div>
                  <div className="student-info">
                    <div className="student-name">{student.student_name}</div>
                    <div className="student-id-label">{student.student_id}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info alert-sm" role="alert">
              No pending students
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div className="courses-section">
          {selectedStudent ? (
            <>
              {/* Student ID Header */}
              <div className="student-header">
                <h5>Student ID: <span className="badge bg-info">{selectedStudent}</span></h5>
                <p className="student-name-text">{getStudentName(selectedStudent)}</p>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Loading courses...</span>
                </div>
              ) : selectedStudentCourses.length > 0 ? (
                <>
                  {/* Courses Table */}
                  <div className="courses-table-container">
                    <table className="table table-hover courses-table">
                      <thead className="table-light">
                        <tr>
                          <th>Course Name</th>
                          <th>Course Code</th>
                          <th>Faculty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudentCourses.map((course) => (
                          <tr key={course.course_offering_id}>
                            <td className="course-name">{course.course_name}</td>
                            <td className="course-code">
                              <code>{course.course_id}</code>
                            </td>
                            <td className="faculty-name">{course.faculty_name || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approve All Button */}
                  <div className="approval-footer">
                    <p className="courses-count">
                      Total Pending Courses: <strong>{selectedStudentCourses.length}</strong>
                    </p>
                    <button
                      className="btn btn-success btn-lg"
                      onClick={handleApproveAllCourses}
                      disabled={approvingStudent === selectedStudent}
                      title="Approve all courses for this student"
                    >
                      {approvingStudent === selectedStudent ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Approving All Courses...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i> Approve All Courses
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="alert alert-info" role="alert">
                  No pending courses for this student
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-cursor-text"></i>
              </div>
              <p className="empty-text">Select a student from the list to view their pending courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationApprovals;
