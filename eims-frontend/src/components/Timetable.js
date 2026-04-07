import { useState, useEffect } from "react";
import API from "../services/api";
import "./Timetable.css";

function Timetable({ userId }) {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTimetable();
  }, [userId]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/student/${userId}/timetable`);
      setTimetable(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const getTimetableByDay = (day) => {
    return timetable.filter(slot => slot.scheduled_day === day);
  };

  const formatTime = (time) => {
    try {
      const parts = time.toString().split(':');
      return `${parts[0]}:${parts[1]}`;
    } catch (e) {
      return time;
    }
  };

  // Check if a class is active at a specific time slot
  const getClassAtSlot = (day, slotTime) => {
    const dayClasses = getTimetableByDay(day);
    return dayClasses.find(cls => {
      const startTime = formatTime(cls.start_time);
      const endTime = formatTime(cls.end_time);
      return startTime <= slotTime && endTime > slotTime;
    });
  };

  // Calculate row span for a class (how many 30-min slots it occupies)
  const getRowSpan = (startTime, endTime) => {
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = timeToMinutes(formatTime(startTime));
    const endMinutes = timeToMinutes(formatTime(endTime));
    const durationMinutes = endMinutes - startMinutes;
    return Math.ceil(durationMinutes / 30); // Each slot is 30 minutes
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  // Generate time slots from 8:00 AM to 12:00 AM (midnight)
  const timeSlots = [];
  for (let hour = 8; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const displayHour = hour === 24 ? 0 : hour;
      const nextHour = hour === 24 ? 1 : (minute === 30 ? hour + 1 : hour);
      const nextMinute = minute === 30 ? 0 : 30;
      const nextDisplayHour = nextHour === 24 ? 0 : nextHour;
      
      const timeStr = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const nextTimeStr = `${String(nextDisplayHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
      timeSlots.push({ time: timeStr, nextTime: nextTimeStr });
      
      if (hour === 24) break; // Stop after midnight
    }
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="fas fa-calendar-week me-2"></i> My Timetable
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {timetable.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle me-2"></i> No classes scheduled
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="timetable-grid mb-4">
              <div className="timetable-wrapper">
                <table className="table table-bordered timetable-table">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="time-col">Time Slot</th>
                      {days.map(day => (
                        <th key={day} className="day-col text-center">
                          <div className="day-full">{day}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, idx) => {
                      // Track which cells are already occupied (due to rowspan)
                      const rowKey = `${slot.time}`;
                      
                      return (
                        <tr key={idx}>
                          <td className="time-col text-center text-muted small">
                            <strong>{slot.time} - {slot.nextTime}</strong>
                          </td>
                          {days.map(day => {
                            const classAtSlot = getClassAtSlot(day, slot.time);
                            
                            // Only render if this is the start time of the class
                            if (classAtSlot) {
                              const rowspan = getRowSpan(classAtSlot.start_time, classAtSlot.end_time);
                              const startTimeStr = formatTime(classAtSlot.start_time);
                              
                              // Only render the cell at its start time
                              if (startTimeStr === slot.time) {
                                return (
                                  <td 
                                    key={day} 
                                    className="class-cell"
                                    rowSpan={rowspan}
                                    style={{
                                      backgroundColor: '#e3f2fd',
                                      borderLeft: '4px solid #2196f3',
                                      padding: '8px',
                                      verticalAlign: 'top'
                                    }}
                                  >
                                    <div className="class-slot">
                                      <div className="course-name">
                                        <strong>{classAtSlot.course_name}</strong>
                                      </div>
                                      <div className="class-time small text-muted">
                                        {formatTime(classAtSlot.start_time)} - {formatTime(classAtSlot.end_time)}
                                      </div>
                                      <div className="class-location small text-muted">
                                        <i className="fas fa-map-marker me-1"></i>
                                        {classAtSlot.building_name} - {classAtSlot.room_number}
                                      </div>
                                    </div>
                                  </td>
                                );
                              } else {
                                // Don't render, it's covered by rowspan
                                return null;
                              }
                            } else {
                              // Empty slot
                              return (
                                <td 
                                  key={day} 
                                  className="class-cell"
                                  style={{
                                    backgroundColor: '#f8f9fa',
                                    minHeight: '60px'
                                  }}
                                >
                                </td>
                              );
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Summary */}
            <div className="row mt-4">
              {days.map(day => {
                const dayClasses = getTimetableByDay(day);
                return (
                  <div key={day} className="col-md-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="fas fa-circle" style={{ color: '#2196f3', fontSize: '8px' }}></i> {day}
                        </h6>
                        {dayClasses.length === 0 ? (
                          <small className="text-muted">No classes</small>
                        ) : (
                          <ul className="list-unstyled">
                            {dayClasses.map((slot, index) => (
                              <li key={index} className="mb-2">
                                <small>
                                  <strong>{slot.course_name}</strong>
                                  <br />
                                  <i className="fas fa-clock me-1"></i>
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  <br />
                                  <i className="fas fa-map-marker me-1"></i>
                                  {slot.building_name} (Room {slot.room_number})
                                </small>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="alert alert-info mt-4">
              <small>
                <i className="fas fa-info-circle me-2"></i>
                <strong>Legend:</strong> Each class spans across all time slots it occupies. Classes are color-coded with blue background and show course name, time, and location.
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Timetable;
