import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CourseFeedback.css';

const CourseFeedback = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('');
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback for selected course
  const fetchCourseFeedback = async (courseOfferingId) => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/course/${courseOfferingId}/feedbacks`);
      setFeedbackData(response.data);
      setSelectedCourse(courseOfferingId);
      setError('');
    } catch (err) {
      setError('Failed to fetch feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const courseInfo = feedbackData && feedbackData.length > 0
    ? { id: feedbackData[0].course_offering_id, name: feedbackData[0].course_name }
    : null;

  return (
    <div className="course-feedback">
      <h3 className="section-title">
        <i className="bi bi-chat-left-quote"></i> Course Feedback
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="feedback-container">
        <div className="course-selector">
          <label className="form-label">
            <strong>Select Course</strong>
          </label>
          <select
            className="form-select"
            onChange={(e) => e.target.value && fetchCourseFeedback(e.target.value)}
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
          <div className="feedback-section">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : feedbackData && feedbackData.length > 0 ? (
              <>
                {courseInfo && (
                  <div className="mb-3">
                    <strong>Course:</strong> {courseInfo.name} &nbsp; 
                    <small className="text-muted">(ID: {courseInfo.id})</small>
                  </div>
                )}

                <h5 className="mt-4 mb-3">Student Feedback</h5>
                <div className="feedback-list">
                  {feedbackData.map((fb, index) => (
                    <div key={index} className="feedback-card">
                      <p className="feedback-text">{fb.feedback}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle"></i> No feedback available for this course yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseFeedback;
