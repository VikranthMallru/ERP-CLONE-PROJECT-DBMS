import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './LeaveRequest.css';

const LeaveRequest = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'apply'
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  // studentId is now passed as prop

  // Fetch leave history on component mount
  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      if (!studentId) return;
      const response = await api.get(`/student/${studentId}/leave-requests`);
      setLeaveHistory(response.data);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
      setError('Please fill in all fields');
      return false;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate < startDate) {
      setError('End date must be after start date');
      return false;
    }

    if (startDate < new Date()) {
      setError('Cannot apply leave for past dates');
      return false;
    }

    return true;
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/student/apply-leave', {
        student_id: studentId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim()
      });

      setSuccessMessage('Leave request submitted successfully!');
      setFormData({
        start_date: '',
        end_date: '',
        reason: ''
      });

      // Refresh leave history
      fetchLeaveHistory();

      // Switch to history tab
      setTimeout(() => {
        setActiveTab('history');
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge bg-warning">Pending</span>;
    const s = status.toString().toLowerCase();
    switch (s) {
      case 'Approved':
        return <span className="badge bg-success">Approved</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'Pending':
        return <span className="badge bg-warning">Pending</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="leave-request">
      <h3 className="section-title">
        <i className="bi bi-calendar2-x"></i> Leave Requests
      </h3>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="bi bi-file-text"></i> Leave History
        </button>
        <button
          className={`tab-button ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          <i className="bi bi-plus-circle"></i> Apply for Leave
        </button>
      </div>
      <div className="status-buttons mb-3">
        <button className="btn btn-warning me-2" disabled>Pending</button>
        <button className="btn btn-success me-2" disabled>Approved</button>
        <button className="btn btn-danger" disabled>Rejected</button>
      </div>

      {/* Leave History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : leaveHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((leave, index) => (
                    <tr
                      key={index}
                      className={
                        leave.status === 'Approved'
                          ? 'table-success'
                          : leave.status === 'Rejected'
                          ? 'table-danger'
                          : ''
                      }
                    >
                      <td>
                        <strong>{new Date(leave.start_date).toLocaleDateString()}</strong>
                      </td>
                      <td>
                        <strong>{new Date(leave.end_date).toLocaleDateString()}</strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {calculateDays(leave.start_date, leave.end_date)} days
                        </span>
                      </td>
                      <td>
                        <small>{leave.reason || 'N/A'}</small>
                      </td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>
                        <small className="text-muted">
                          {(() => {
                            const dateStr = leave.applied_on || leave.created_at || leave.submitted_date || leave.start_date;
                              if (!dateStr) return 'N/A';
                              const d = new Date(dateStr);
                              return isNaN(d) ? dateStr : d.toLocaleDateString();
                          })()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p className="text-muted">No leave requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Apply for Leave Tab */}
      {activeTab === 'apply' && (
        <div className="tab-content">
          <div className="form-container">
            <form onSubmit={handleSubmitLeave}>
              <div className="mb-4">
                <label className="form-label">
                  <strong>Start Date</strong>
                </label>
                <input
                  type="date"
                  name="start_date"
                  className="form-control"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">
                  <strong>End Date</strong>
                </label>
                <input
                  type="date"
                  name="end_date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {formData.start_date && formData.end_date && (
                <div className="days-info mb-4">
                  <small className="text-muted">
                    Total Days: <strong>{calculateDays(formData.start_date, formData.end_date)} days</strong>
                  </small>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">
                  <strong>Reason for Leave</strong>
                </label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows="4"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Please provide a reason for your leave request..."
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.start_date || !formData.end_date || !formData.reason.trim()}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send"></i> Submit Leave Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFormData({
                      start_date: '',
                      end_date: '',
                      reason: ''
                    });
                    setError('');
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;
