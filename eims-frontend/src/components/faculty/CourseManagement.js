import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CourseManagement.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const facultyId = localStorage.getItem('user_id');

  // Fetch current courses for the faculty
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/${facultyId}/current-courses`);
      setCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for a specific course
  const fetchStudents = async (courseOfferingId) => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/course/${courseOfferingId}/students`);
      setStudents(response.data);
      setSelectedCourse(courseOfferingId);
      setError('');
    } catch (err) {
      setError('Failed to fetch students for this course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-management">
      <h3 className="section-title">
        <i className="bi bi-book"></i> Course Management
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="courses-container">
        <div className="courses-list">
          <h5>Your Current Courses</h5>
          {loading && !selectedCourse ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="course-cards">
              {courses.map((course) => (
                <div
                  key={course.course_offering_id}
                  className={`course-card ${selectedCourse === course.course_offering_id ? 'active' : ''}`}
                  onClick={() => fetchStudents(course.course_offering_id)}
                >
                  <div className="course-header">
                    <h6>{course.course_name}</h6>
                    <span className="course-code">{course.course_code}</span>
                  </div>
                  <div className="course-details">
                    <small>
                      <strong>Section:</strong> {course.section}
                    </small>
                    <small>
                      <strong>Semester:</strong> {course.semester}
                    </small>
                    <small>
                      <strong>Capacity:</strong> {course.enrolled_students}/{course.capacity}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => fetchStudents(course.course_offering_id)}
                  >
                    View Students
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No courses assigned</p>
          )}
        </div>

        <div className="students-list">
          {selectedCourse ? (
            <>
              <h5>Enrolled Students</h5>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.student_id}>
                          <td>{student.student_id}</td>
                          <td>{student.student_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-muted mt-3">
                    Total Students: <strong>{students.length}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-muted">No students enrolled in this course</p>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p className="text-muted">Select a course to view enrolled students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
