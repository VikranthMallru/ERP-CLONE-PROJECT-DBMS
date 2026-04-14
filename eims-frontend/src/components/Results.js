import React, { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/Results.css';

export default function Results({ userId }) {
  const [results, setResults] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
    fetchGrades();
  }, [userId]);

  const fetchResults = async () => {
    try {
      const response = await API.get(`/student/${userId}/results`);
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch results');
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await API.get(`/student/${userId}/grades`);
      setGrades(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to fetch grades');
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Ex':
      case 'A':
        return '#d4edda';
      case 'B':
        return '#cfe2ff';
      case 'C':
        return '#fff3cd';
      case 'D':
        return '#f8d7da';
      case 'E':
      case 'F':
        return '#f5c2c7';
      case 'P':
        return '#d1e7dd';
      default:
        return '#f5f5f5';
    }
  };

  const getGradePoint = (grade) => {
    const gradePoints = {
      'Ex': 10,
      'A': 9,
      'B': 8,
      'C': 7,
      'D': 6,
      'E': 5,
      'P': 4,
      'F': 0
    };
    return gradePoints[grade] || 0;
  };

  const groupByExtension = (grades) => {
    const grouped = {};
    grades.forEach(g => {
      const key = `${g.year_offering} - Semester ${g.semester}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(g);
    });
    return grouped;
  };

  const gradesByExtension = groupByExtension(grades);

  if (loading) return <div className="text-center p-4">Loading results...</div>;

  return (
    <div className="results-container">
      <h3 className="mb-4">📊 Academic Results</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* CGPA and Credits Summary */}
      {results && (
        <div className="summary-cards mb-4">
          <div className="summary-card cgpa-card">
            <div className="card-label">CGPA</div>
            <div className="card-value">{(parseFloat(results.cgpa) || 0).toFixed(2)}</div>
            <div className="card-max-out">out of 10</div>
          </div>
          <div className="summary-card credits-card">
            <div className="card-label">Total Credits</div>
            <div className="card-value">{parseInt(results.total_credits) || 0}</div>
            <div className="card-max-out">Credits Earned</div>
          </div>
        </div>
      )}

      {/* Grades by Semester */}
      <div className="grades-section">
        <h5 className="mb-3">📚 Course Grades</h5>
        {grades.length > 0 ? (
          <div className="extension-groups">
            {Object.keys(gradesByExtension)
              .sort()
              .reverse()
              .map((extension, idx) => (
                <div key={idx} className="extension-group mb-4">
                  <div className="extension-header">
                    <h6>{extension}</h6>
                    <span className="course-count">
                      {gradesByExtension[extension].length} courses
                    </span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover table-sm grades-table">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Grade</th>
                          <th>Grade Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradesByExtension[extension].map((grade, gradeIdx) => (
                          <tr
                            key={gradeIdx}
                            style={{ backgroundColor: getGradeColor(grade.grade) }}
                          >
                            <td>
                              <strong>{grade.course_id || 'N/A'}</strong>
                            </td>
                            <td>{grade.course_name || 'N/A'}</td>
                            <td>
                              <span className="badge badge-grade">
                                {grade.grade || 'N/A'}
                              </span>
                            </td>
                            <td>{getGradePoint(grade.grade).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="alert alert-info">
            No grades available yet.
          </div>
        )}
      </div>
    </div>
  );
}
