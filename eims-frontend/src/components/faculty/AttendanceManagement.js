import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const facultyId = localStorage.getItem('user_id');

  // Fetch current courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/${facultyId}/current-courses`);
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students and attendance for selected course and date
  const fetchAttendance = async (courseOfferingId) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/faculty/course/${courseOfferingId}/students-attendance?date=${selectedDate}`
      );
      setStudents(response.data);
      setSelectedCourse(courseOfferingId);
      // Initialize attendance state
      const initialAttendance = {};
      response.data.forEach((student) => {
        initialAttendance[student.student_id] = student.is_present || false;
      });
      setAttendance(initialAttendance);
      setError('');
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      const attendanceData = Object.keys(attendance).map((studentId) => ({
        student_id: parseInt(studentId),
        course_offering_id: selectedCourse,
        date: selectedDate,
        is_present: attendance[studentId]
      }));

      await api.post('/faculty/mark-attendance', {
        attendance: attendanceData
      });

      setSuccessMessage('Attendance marked successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to submit attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-management">
      <h3 className="section-title">
        <i className="bi bi-calendar-check"></i> Attendance Management
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="controls-section">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              <strong>Select Course</strong>
            </label>
            <select
              className="form-select"
              onChange={(e) => e.target.value && fetchAttendance(e.target.value)}
              value={selectedCourse || ''}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.course_offering_id} value={course.course_offering_id}>
                  {course.course_name} ({course.course_code}) - Section {course.section}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              <strong>Date</strong>
            </label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (selectedCourse) {
                  fetchAttendance(selectedCourse);
                }
              }}
            />
          </div>
        </div>
      </div>

      {selectedCourse && (
        <div className="attendance-section mt-4">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : students.length > 0 ? (
            <>
              <h5>Student Attendance - {new Date(selectedDate).toLocaleDateString()}</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={(e) => {
                            const newAttendance = { ...attendance };
                            students.forEach((student) => {
                              newAttendance[student.student_id] = e.target.checked;
                            });
                            setAttendance(newAttendance);
                          }}
                        />
                      </th>
                      <th>Roll No</th>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr
                        key={student.student_id}
                        className={attendance[student.student_id] ? 'table-success' : ''}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={attendance[student.student_id] || false}
                            onChange={() => toggleAttendance(student.student_id)}
                          />
                        </td>
                        <td>{index + 1}</td>
                        <td>
                          <span className="badge bg-info">{student.student_id}</span>
                        </td>
                        <td>{student.name}</td>
                        <td>
                          {attendance[student.student_id] ? (
                            <span className="badge bg-success">Present</span>
                          ) : (
                            <span className="badge bg-danger">Absent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="attendance-summary mt-3">
                <p>
                  <strong>Total Students:</strong> {students.length} |{' '}
                  <strong>Present:</strong>{' '}
                  <span className="badge bg-success">
                    {Object.values(attendance).filter(Boolean).length}
                  </span>{' '}
                  | <strong>Absent:</strong>{' '}
                  <span className="badge bg-danger">
                    {students.length - Object.values(attendance).filter(Boolean).length}
                  </span>
                </p>
              </div>

              <button
                className="btn btn-primary mt-3"
                onClick={handleSubmitAttendance}
                disabled={loading}
              >
                <i className="bi bi-check-circle"></i> Submit Attendance
              </button>
            </>
          ) : (
            <p className="text-muted">No students found for this course</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
