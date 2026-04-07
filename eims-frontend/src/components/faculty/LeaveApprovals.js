import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './LeaveApprovals.css';

const LeaveApprovals = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/${facultyId}/leave-requests`);
      setLeaveRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveRequestId, approved) => {
    try {
      setLoading(true);
      await api.post('/faculty/leave-action', {
        leave_request_id: leaveRequestId,
        status: approved ? 'approved' : 'rejected'
      });
      setSuccessMessage(approved ? 'Leave approved!' : 'Leave rejected!');
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
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning">Pending</span>;
    }
  };

  const filteredRequests =
    filterStatus === 'all'
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  const pendingRequests = leaveRequests.filter((req) => req.status === 'pending');
  const approvedRequests = leaveRequests.filter((req) => req.status === 'approved');
  const rejectedRequests = leaveRequests.filter((req) => req.status === 'rejected');

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
          className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button
          className={`btn btn-sm ${filterStatus === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setFilterStatus('approved')}
        >
          Approved
        </button>
        <button
          className={`btn btn-sm ${filterStatus === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected
        </button>
        <button
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => setFilterStatus('all')}
        >
          All
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
                <th>Leave Type</th>
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
                  key={request.leave_request_id}
                  className={
                    request.status === 'approved'
                      ? 'table-success'
                      : request.status === 'rejected'
                      ? 'table-danger'
                      : ''
                  }
                >
                  <td>
                    <span className="badge bg-info">{request.student_id}</span>
                  </td>
                  <td>{request.student_name}</td>
                  <td>
                    <span className="badge bg-light text-dark">{request.leave_type}</span>
                  </td>
                  <td>
                    <small>{new Date(request.from_date).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <small>{new Date(request.to_date).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <small className="text-muted">{request.reason || 'N/A'}</small>
                  </td>
                  <td>
                    <strong>{request.number_of_days}</strong>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.status === 'pending' ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleLeaveAction(request.leave_request_id, true)}
                          disabled={loading}
                        >
                          <i className="bi bi-check"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleLeaveAction(request.leave_request_id, false)}
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
