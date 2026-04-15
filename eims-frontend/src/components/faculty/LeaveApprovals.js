import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './LeaveApprovals.css';

const LeaveApprovals = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending'); // 'all', 'pending', 'approved', 'rejected'
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/${facultyId}/leave-requests`);
      // Normalize status and dates
      const normalized = response.data.map(req => ({
        ...req,
        status: req.status ? req.status: '',
        start_date: req.start_date ? new Date(req.start_date) : null,
        end_date: req.end_date ? new Date(req.end_date) : null,
        applied_on: req.applied_on ? new Date(req.applied_on) : null,
      }));
      setLeaveRequests(normalized);
      setError('');
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (requestId, Approved) => {
    try {
      setLoading(true);
      await api.post('/faculty/leave-action', {
        request_id: requestId,
        action: Approved ? 'Approved' : 'Rejected'
      });
      setSuccessMessage(Approved ? 'Leave approved!' : 'Leave rejected!');
      fetchLeaveRequests();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to process leave request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge bg-success">Approved</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning">Pending</span>;
    }
  };

  const filteredRequests =
    filterStatus === 'all'
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  const pendingRequests = leaveRequests.filter((req) => req.status === 'Pending');
  const approvedRequests = leaveRequests.filter((req) => req.status === 'Approved');
  const rejectedRequests = leaveRequests.filter((req) => req.status === 'Rejected');

  // Helper to calculate days
  const getDays = (from, to) => {
    if (!from || !to) return '-';
    const diff = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : '-';
  };

  // Define a placeholder function for fetchCourseRegistrations
  const fetchCourseRegistrations = () => {
    console.warn('fetchCourseRegistrations is not implemented yet.');
  };

  const handleCourseApproval = async (studentId, courseOfferingId) => {
    try {
      setLoading(true);
      await api.post('/faculty/approve', {
        student_id: studentId,
        course_offering_id: courseOfferingId
      });
      setSuccessMessage('Course approved successfully!');
      fetchCourseRegistrations(); // Refresh the course registrations list
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to approve course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-approvals">
      <h3 className="section-title">
        <i className="bi bi-calendar2-x"></i> Leave Approvals
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="stats-section mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <div className="stat-card stat-pending">
              <h6>Pending</h6>
              <h4>{pendingRequests.length}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card stat-approved">
              <h6>Approved</h6>
              <h4>{approvedRequests.length}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card stat-rejected">
              <h6>Rejected</h6>
              <h4>{rejectedRequests.length}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card stat-total">
              <h6>Total</h6>
              <h4>{leaveRequests.length}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-section mb-3">
        <button
          className={`btn btn-sm ${filterStatus === 'Pending' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilterStatus('Pending')}
        >
          Pending
        </button>
        <button
          className={`btn btn-sm ${filterStatus === 'Approved' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setFilterStatus('Approved')}
        >
          Approved
        </button>
        <button
          className={`btn btn-sm ${filterStatus === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setFilterStatus('Rejected')}
        >
          Rejected
        </button>
      </div>

      {loading && !leaveRequests.length ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.request_id}
                  className={
                    request.status === 'Approved'
                      ? 'table-success'
                      : request.status === 'Rejected'
                      ? 'table-danger'
                      : ''
                  }
                >
                  <td>
                    <span className="badge bg-info">{request.student_id}</span>
                  </td>
                  <td>{request.student_name}</td>
                  <td>
                    <small>{request.start_date ? request.start_date.toLocaleDateString() : '-'}</small>
                  </td>
                  <td>
                    <small>{request.end_date ? request.end_date.toLocaleDateString() : '-'}</small>
                  </td>
                  <td>
                    <small className="text-muted">{request.reason || 'N/A'}</small>
                  </td>
                  <td>
                    <strong>{getDays(request.start_date, request.end_date)}</strong>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.status === 'Pending' ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleLeaveAction(request.request_id, true)}
                          disabled={loading}
                        >
                          <i className="bi bi-check"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleLeaveAction(request.request_id, false)}
                          disabled={loading}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </>
                    ) : (
                      <span className="text-muted small">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle"></i> No leave requests found
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;
