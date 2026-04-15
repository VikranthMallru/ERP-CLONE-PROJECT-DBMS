import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './RoomBookings.css';

const RoomBookings = () => {
  // State for course selection
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // State for booking details
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const facultyId = localStorage.getItem('user_id');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  useEffect(() => {
    fetchCourses();
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      console.log('Fetching buildings from database');
      const response = await api.get('/faculty/buildings');
      console.log('Buildings response:', response.data);
      setBuildings(response.data);
      if (response.data.length > 0) {
        setSelectedBuilding(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setBuildings([]);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses for faculty:', facultyId);
      const response = await api.get(`/faculty/${facultyId}/current-courses`);
      console.log('Courses response:', response.data);
      setCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses: ' + (err.response?.data?.error || err.message));
      console.error('Courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching available rooms for building:', selectedBuilding);
      const response = await api.get(`/faculty/available-slots?building=${selectedBuilding}`);
      console.log('Available rooms:', response.data);
      setAvailableRooms(response.data);
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    console.log('Selected course:', course);
  };

  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
    setSelectedRoom(null);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    
    // Automatically set end time to 1 hour later
    const [hours, mins] = newTime.split(':');
    const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    setEndTime(`${nextHour}:${mins}`);
  };

  const handleBookClass = async () => {
    if (!selectedCourse || !selectedDay || !selectedTime || !selectedBuilding || !selectedRoom) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        course_offering_id: selectedCourse.course_offering_id,
        room_id: selectedRoom.room_id,
        building_name: selectedBuilding,
        scheduled_day: selectedDay,
        start_time: selectedTime,
        end_time: endTime,
        booked_by_faculty_id: facultyId
      };

      console.log('Booking class:', bookingData);

      await api.post('/faculty/book-class', bookingData);

      setSuccessMessage(`${selectedCourse.course_name} scheduled for ${selectedDay} at ${selectedTime}!`);
      
      // Reset form
      setSelectedCourse(null);
      setSelectedDay('Monday');
      setSelectedTime('09:00');
      setSelectedBuilding('Main Building');
      setSelectedRoom(null);
      setAvailableRooms([]);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to book class: ' + (err.response?.data?.error || err.message));
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-bookings">
      <h3 className="section-title">
        <i className="bi bi-door-closed"></i> Class Schedule & Room Booking
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

      <div className="booking-container">
          {/* Step 1: Select Course */}
          <div className="booking-step">
            <h5 className="step-title">
              <span className="step-number">1</span> Select Course
            </h5>
            {loading && courses.length === 0 ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading courses...</span>
                </div>
              </div>
            ) : courses.length > 0 ? (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div
                    key={course.course_offering_id}
                    className={`course-card ${selectedCourse?.course_offering_id === course.course_offering_id ? 'selected' : ''}`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="course-header">
                      <h6>{course.course_name}</h6>
                      <small className="text-muted">{course.course_code}</small>
                    </div>
                    <div className="course-info">
                      <p><strong>Section:</strong> {course.section}</p>
                    </div>
                    <div className="course-select-btn">
                      <button 
                        className={`btn btn-sm ${selectedCourse?.course_offering_id === course.course_offering_id ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        {selectedCourse?.course_offering_id === course.course_offering_id ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i> No current courses found
              </div>
            )}
          </div>

          {/* Step 2: Select Schedule Details */}
          {selectedCourse && (
            <div className="booking-step">
              <h5 className="step-title">
                <span className="step-number">2</span> Select Schedule Details
              </h5>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Day of Week</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Start Time</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedTime}
                    onChange={handleTimeChange}
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>End Time</strong>
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Building</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedBuilding}
                    onChange={handleBuildingChange}
                  >
                    <option value="">Select a building...</option>
                    {buildings.map((building) => (
                      <option key={building} value={building}>
                        {building}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Room */}
          {selectedCourse && selectedBuilding && (
            <div className="booking-step">
              <h5 className="step-title">
                <span className="step-number">3</span> Select Room
              </h5>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <button
                    className="btn btn-info mb-3"
                    onClick={fetchAvailableRooms}
                    disabled={loading}
                  >
                    <i className="bi bi-search"></i> Load Available Rooms
                  </button>
                </div>
              </div>

              {availableRooms.length > 0 ? (
                <div className="rooms-grid">
                  {availableRooms.map((room) => (
                    <div
                      key={`${room.room_id}-${room.building_name}`}
                      className={`room-card ${selectedRoom?.room_id === room.room_id && selectedRoom?.building_name === room.building_name ? 'selected' : ''}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="room-header">
                        <h6>Room {room.room_id}</h6>
                        <span className="badge bg-light text-dark">{room.building_name}</span>
                      </div>
                      <div className="room-info">
                        <p><strong>Capacity:</strong> {room.capacity || room.room_capacity || 'N/A'}</p>
                      </div>
                      <button
                        className={`btn btn-sm ${selectedRoom?.room_id === room.room_id && selectedRoom?.building_name === room.building_name ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        {selectedRoom?.room_id === room.room_id && selectedRoom?.building_name === room.building_name ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle"></i> Click "Load Available Rooms" to see available classrooms
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm Booking */}
          {selectedCourse && selectedDay && selectedTime && selectedBuilding && selectedRoom && (
            <div className="booking-step booking-confirm">
              <h5 className="step-title">
                <span className="step-number">4</span> Confirm Booking
              </h5>
              
              <div className="summary-box">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Course:</strong> {selectedCourse.course_name}</p>
                    <p><strong>Code:</strong> {selectedCourse.course_code}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Day:</strong> {selectedDay}</p>
                    <p><strong>Time:</strong> {selectedTime} - {endTime}</p>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <p><strong>Building:</strong> {selectedBuilding}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Room:</strong> {selectedRoom.room_id}</p>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-success btn-lg"
                onClick={handleBookClass}
                disabled={loading}
              >
                <i className="bi bi-check-circle"></i> Confirm & Schedule Class
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default RoomBookings;
