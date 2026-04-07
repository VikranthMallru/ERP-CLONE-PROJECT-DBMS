import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './GradeManagement.css';

const GradeManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadMode, setUploadMode] = useState('form'); // 'form' or 'csv'
  const [csvFile, setCsvFile] = useState(null);
  const facultyId = localStorage.getItem('user_id');

  const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

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

  // Fetch students for selected course
  const fetchStudents = async (courseOfferingId) => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/course/${courseOfferingId}/students`);
      setStudents(response.data);
      setSelectedCourse(courseOfferingId);
      // Initialize grades
      const initialGrades = {};
      response.data.forEach((student) => {
        initialGrades[student.student_id] = '';
      });
      setGrades(initialGrades);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId, grade) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: grade
    }));
  };

  const handleSubmitGrades = async () => {
    try {
      setLoading(true);
      const gradesData = Object.keys(grades)
        .filter((studentId) => grades[studentId])
        .map((studentId) => ({
          student_id: parseInt(studentId),
          course_offering_id: selectedCourse,
          grade: grades[studentId]
        }));

      if (gradesData.length === 0) {
        setError('Please assign grades to at least one student');
        setLoading(false);
        return;
      }

      await api.post('/faculty/upload-grades', {
        grades: gradesData
      });

      setSuccessMessage('Grades submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to submit grades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('course_offering_id', selectedCourse);

      await api.post('/faculty/upload-grades-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMessage('Grades uploaded successfully!');
      setCsvFile(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload CSV');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grade-management">
      <h3 className="section-title">
        <i className="bi bi-graph-up"></i> Grade Management
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="controls-section mb-4">
        <label className="form-label">
          <strong>Select Course</strong>
        </label>
        <select
          className="form-select"
          onChange={(e) => e.target.value && fetchStudents(e.target.value)}
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

      {selectedCourse && (
        <div className="grade-input-section">
          <div className="mode-toggle mb-3">
            <button
              className={`btn ${uploadMode === 'form' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setUploadMode('form')}
            >
              Manual Entry
            </button>
            <button
              className={`btn ${uploadMode === 'csv' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setUploadMode('csv')}
            >
              CSV Upload
            </button>
          </div>

          {uploadMode === 'form' ? (
            <>
              <h5>Enter Grades</h5>
              {loading && !students.length ? (
                <div className="loading-spinner">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Roll No</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student.student_id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-info">{student.student_id}</span>
                            </td>
                            <td>{student.name}</td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={grades[student.student_id] || ''}
                                onChange={(e) => updateGrade(student.student_id, e.target.value)}
                              >
                                <option value="">Select grade</option>
                                {gradeOptions.map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    className="btn btn-success mt-3"
                    onClick={handleSubmitGrades}
                    disabled={loading}
                  >
                    <i className="bi bi-check-circle"></i> Submit Grades
                  </button>
                </>
              ) : (
                <p className="text-muted">No students found for this course</p>
              )}
            </>
          ) : (
            <div className="csv-upload-section">
              <h5>Upload Grades from CSV</h5>
              <div className="card bg-light p-4">
                <p className="text-muted mb-3">
                  CSV Format: student_id, grade<br />
                  Example:<br />
                  <code>1001,A+</code><br />
                  <code>1002,B</code>
                </p>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                </div>
                <button
                  className="btn btn-success"
                  onClick={handleCSVUpload}
                  disabled={loading || !csvFile}
                >
                  <i className="bi bi-upload"></i> Upload CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradeManagement;
