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

  const calculateStats = () => {
    if (!feedbackData || feedbackData.length === 0) return null;

    const totalFeedback = feedbackData.length;
    const avgRating =
      feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback;

    const sentimentCount = {
      positive: feedbackData.filter((f) => f.sentiment === 'positive').length,
      neutral: feedbackData.filter((f) => f.sentiment === 'neutral').length,
      negative: feedbackData.filter((f) => f.sentiment === 'negative').length
    };

    return {
      totalFeedback,
      avgRating: avgRating.toFixed(2),
      sentimentCount
    };
  };

  const stats = calculateStats();

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <span className="badge bg-success">Positive</span>;
      case 'negative':
        return <span className="badge bg-danger">Negative</span>;
      default:
        return <span className="badge bg-warning">Neutral</span>;
    }
  };

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
                <div className="stats-cards">
                  <div className="stat-card">
                    <h6>Total Feedback</h6>
                    <h4>{stats.totalFeedback}</h4>
                  </div>
                  <div className="stat-card">
                    <h6>Average Rating</h6>
                    <h4>
                      {stats.avgRating}
                      <span className="small">/5.0</span>
                    </h4>
                  </div>
                  <div className="stat-card">
                    <h6>Positive</h6>
                    <h4 className="text-success">{stats.sentimentCount.positive}</h4>
                  </div>
                  <div className="stat-card">
                    <h6>Neutral</h6>
                    <h4 className="text-warning">{stats.sentimentCount.neutral}</h4>
                  </div>
                  <div className="stat-card">
                    <h6>Negative</h6>
                    <h4 className="text-danger">{stats.sentimentCount.negative}</h4>
                  </div>
                </div>

                <h5 className="mt-4 mb-3">Student Feedback</h5>
                <div className="feedback-list">
                  {feedbackData.map((feedback, index) => (
                    <div key={index} className="feedback-card">
                      <div className="feedback-header">
                        <div className="student-info">
                          <strong>{feedback.student_name}</strong>
                          <small className="text-muted">ID: {feedback.student_id}</small>
                        </div>
                        <div className="feedback-meta">
                          {getSentimentBadge(feedback.sentiment)}
                          {feedback.rating && (
                            <span className="rating-badge">
                              ⭐ {feedback.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="feedback-text">{feedback.feedback_text}</p>
                      {feedback.suggestions && (
                        <div className="suggestions-section">
                          <strong>Suggestions:</strong>
                          <p>{feedback.suggestions}</p>
                        </div>
                      )}
                      <small className="text-muted">
                        {new Date(feedback.submission_date).toLocaleDateString()}
                      </small>
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
