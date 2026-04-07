import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './RoomBookings.css';

const RoomBookings = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'mybookings'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingReason, setBookingReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const facultyId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchAvailableSlots();
    fetchMyBookings();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/available-slots?date=${filterDate}`);
      setAvailableSlots(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch available slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.get(`/faculty/${facultyId}/bookings`);
      setMyBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleBookRoom = async () => {
    if (!selectedSlot || !bookingReason.trim()) {
      setError('Please select a slot and provide a reason');
      return;
    }

    try {
      setLoading(true);
      await api.post('/faculty/book-rooms', {
        room_id: selectedSlot.room_id,
        slot_id: selectedSlot.slot_id,
        booking_reason: bookingReason,
        booked_by_faculty_id: facultyId
      });

      setSuccessMessage('Room booked successfully!');
      setBookingReason('');
      setSelectedSlot(null);
      fetchAvailableSlots();
      fetchMyBookings();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to book room');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge bg-success">Confirmed</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const upcomingBookings = myBookings.filter(
    (b) => new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  );
  const pastBookings = myBookings.filter(
    (b) => new Date(b.booking_date) < new Date() || b.status === 'cancelled'
  );

  return (
    <div className="room-bookings">
      <h3 className="section-title">
        <i className="bi bi-door-closed"></i> Room Bookings
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="tabs-navigation">
        <button
          className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <i className="bi bi-search"></i> Browse & Book
        </button>
        <button
          className={`nav-tab ${activeTab === 'mybookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mybookings')}
        >
          <i className="bi bi-calendar-check"></i> My Bookings
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="browse-section">
          <div className="controls mb-4">
            <label className="form-label">
              <strong>Select Date</strong>
            </label>
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                fetchAvailableSlots();
              }}
            />
          </div>

          {loading && !availableSlots.length ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : availableSlots.length > 0 ? (
            <>
              <div className="slots-grid">
                {availableSlots.map((slot) => (
                  <div
                    key={`${slot.room_id}-${slot.slot_id}`}
                    className={`slot-card ${
                      selectedSlot &&
                      selectedSlot.room_id === slot.room_id &&
                      selectedSlot.slot_id === slot.slot_id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="slot-header">
                      <h6>{slot.room_name || `Room ${slot.room_id}`}</h6>
                      <span className="badge bg-light text-dark">Building {slot.building_number}</span>
                    </div>
                    <div className="slot-details">
                      <p>
                        <strong>Time Slot:</strong> {slot.start_time} - {slot.end_time}
                      </p>
                      <p>
                        <strong>Capacity:</strong> {slot.room_capacity}
                      </p>
                      <p>
                        <strong>Facilities:</strong> <small>{slot.room_facilities || 'N/A'}</small>
                      </p>
                    </div>
                    <button
                      className={`btn btn-sm ${
                        selectedSlot &&
                        selectedSlot.room_id === slot.room_id &&
                        selectedSlot.slot_id === slot.slot_id
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                    >
                      {selectedSlot &&
                      selectedSlot.room_id === slot.room_id &&
                      selectedSlot.slot_id === slot.slot_id
                        ? 'Selected'
                        : 'Select'}
                    </button>
                  </div>
                ))}
              </div>

              {selectedSlot && (
                <div className="booking-form mt-4">
                  <h5>Confirm Booking</h5>
                  <div className="selected-slot-info mb-3">
                    <p>
                      <strong>Room:</strong> {selectedSlot.room_name || `Room ${selectedSlot.room_id}`}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(filterDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Reason for Booking</strong>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      placeholder="Enter reason for room booking (e.g., Class, Meeting, Extra Classes)"
                    ></textarea>
                  </div>

                  <button
                    className="btn btn-success"
                    onClick={handleBookRoom}
                    disabled={loading || !bookingReason.trim()}
                  >
                    <i className="bi bi-check-circle"></i> Confirm Booking
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> No available rooms for the selected date
            </div>
          )}
        </div>
      ) : (
        <div className="mybookings-section">
          <div className="booking-tabs">
            <h5>Upcoming Bookings ({upcomingBookings.length})</h5>
            {upcomingBookings.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Room</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBookings.map((booking, index) => (
                      <tr key={index}>
                        <td>{booking.room_name || `Room ${booking.room_id}`}</td>
                        <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                        <td>
                          {booking.start_time} - {booking.end_time}
                        </td>
                        <td>
                          <small>{booking.booking_reason}</small>
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No upcoming bookings</p>
            )}

            <h5 className="mt-4">Past Bookings ({pastBookings.length})</h5>
            {pastBookings.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Room</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastBookings.map((booking, index) => (
                      <tr key={index} className="table-secondary">
                        <td>{booking.room_name || `Room ${booking.room_id}`}</td>
                        <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                        <td>
                          {booking.start_time} - {booking.end_time}
                        </td>
                        <td>
                          <small>{booking.booking_reason}</small>
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No past bookings</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBookings;
