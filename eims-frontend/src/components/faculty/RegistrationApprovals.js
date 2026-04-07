import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './RegistrationApprovals.css';

const RegistrationApprovals = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/pending/${facultyId}`);
      setPendingRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch pending requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (studentId, courseOfferingId, approved) => {
    try {
      setLoading(true);
      await api.post('/faculty/approve', {
        student_id: studentId,
        course_offering_id: courseOfferingId,
        status: approved ? 'approved' : 'rejected'
      });
      setSuccessMessage(approved ? 'Request approved!' : 'Request rejected!');
      fetchPendingRequests();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to process request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-approvals">
      <h3 className="section-title">
        <i className="bi bi-check-circle"></i> Pending Registration Approvals
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      {loading && !pendingRequests.length ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : pendingRequests.length > 0 ? (
        <div className="approvals-table">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Course Code</th>
                  <th>Requested Date</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={`${request.student_id}-${request.course_offering_id}`}>
                    <td>
                      <span className="badge bg-info">{request.student_id}</span>
                    </td>
                    <td>{request.student_name}</td>
                    <td>{request.course_name}</td>
                    <td>
                      <code>{request.course_code}</code>
                    </td>
                    <td>
                      <small>{new Date(request.requested_date).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <small className="text-muted">{request.reason || 'N/A'}</small>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() =>
                          handleApproval(request.student_id, request.course_offering_id, true)
                        }
                        disabled={loading}
                      >
                        <i className="bi bi-check"></i> Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleApproval(request.student_id, request.course_offering_id, false)
                        }
                        disabled={loading}
                      >
                        <i className="bi bi-x"></i> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-3">
            Total Pending: <strong>{pendingRequests.length}</strong>
          </p>
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle"></i> No pending registration requests
        </div>
      )}
    </div>
  );
};

export default RegistrationApprovals;
