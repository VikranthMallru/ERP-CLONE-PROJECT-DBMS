import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultySchedule.css';

const FacultySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const facultyId = localStorage.getItem('user_id');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Generate 30-minute time slots with interval display
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const start = `${String(hour).padStart(2, '0')}:00`;
      const end = `${String(hour).padStart(2, '0')}:30`;
      slots.push({ start, end, display: `${start} - ${end}` });
      
      if (hour < 16) {
        const nextStart = `${String(hour).padStart(2, '0')}:30`;
        const nextEnd = hour === 15 ? '16:00' : `${String(hour + 1).padStart(2, '0')}:00`;
        slots.push({ start: nextStart, end: nextEnd, display: `${nextStart} - ${nextEnd}` });
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Calculate how many slots a class spans
  const getRowSpan = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;
    
    return Math.max(1, durationMinutes / 30);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedule for faculty:', facultyId);
      const response = await api.get(`/faculty/${facultyId}/schedule`);
      console.log('Schedule response:', response.data);
      
      // Normalize times to HH:MM format
      const normalizedSchedule = response.data.map(item => ({
        ...item,
        start_time: item.start_time ? item.start_time.substring(0, 5) : item.start_time,
        end_time: item.end_time ? item.end_time.substring(0, 5) : item.end_time
      }));
      
      console.log('Normalized schedule:', normalizedSchedule);
      setSchedule(normalizedSchedule);
      setError('');
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to fetch schedule');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-schedule">
      <h3 className="section-title">
        <i className="bi bi-calendar-week"></i> My Weekly Schedule
      </h3>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading && schedule.length === 0 ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading schedule...</span>
          </div>
        </div>
      ) : (
        <>
          {schedule.length > 0 ? (
            <div className="timetable-container">
              <div className="table-responsive">
                <table className="timetable">
                  <thead>
                    <tr>
                      <th>Time</th>
                      {daysOfWeek.map((day) => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => {
                      // Check if a class starts at this time slot
                      const classAtThisTime = schedule.find(
                        (c) => c.scheduled_day && timeSlots.some(
                          s => s.start === slot.start && c.scheduled_day === 
                            Object.keys(daysOfWeek).length > 0 ? true : false
                        )
                      );
                      
                      return (
                        <tr key={slot.start}>
                          <td className="time-slot">
                            <strong>{slot.display}</strong>
                        </td>
                        {daysOfWeek.map((day) => {
                          const classInfo = schedule.find(
                            (c) => c.scheduled_day === day && c.start_time === slot.start
                          );
                          
                          // Check if this slot is within a class duration
                          const isWithinClass = schedule.some(c => {
                            if (c.scheduled_day !== day) return false;
                            const [startHour, startMin] = c.start_time.split(':').map(Number);
                            const [endHour, endMin] = c.end_time.split(':').map(Number);
                            const [slotHour, slotMin] = slot.start.split(':').map(Number);
                            
                            const classStart = startHour * 60 + startMin;
                            const classEnd = endHour * 60 + endMin;
                            const slotTime = slotHour * 60 + slotMin;
                            
                            return slotTime >= classStart && slotTime < classEnd;
                          });
                          
                          if (classInfo) {
                            const rowSpan = getRowSpan(classInfo.start_time, classInfo.end_time);
                            return (
                              <td 
                                key={`${day}-${slot.start}`} 
                                className="schedule-cell"
                                style={{ 
                                  backgroundColor: '#bbdefb',
                                  verticalAlign: 'top',
                                  padding: '8px'
                                }}
                                rowSpan={rowSpan}
                              >
                                <div className="class-cell" style={{ border: 'none', background: 'transparent' }}>
                                  <div className="course-name">
                                    <strong>{classInfo.course_name}</strong>
                                  </div>
                                  <div className="course-id">{classInfo.course_id}</div>
                                  <div className="location-info">
                                    {classInfo.building_name} - Room {classInfo.room_number}
                                  </div>
                                  <div className="time-info">
                                    {classInfo.start_time} - {classInfo.end_time}
                                  </div>
                                </div>
                              </td>
                            );
                          } else if (!isWithinClass) {
                            return (
                              <td key={`${day}-${slot.start}`} className="schedule-cell">
                                <div className="empty-cell"></div>
                              </td>
                            );
                          } else {
                            return null; // This cell is within a class that already spans here
                          }
                        })}
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Card */}
              <div className="schedule-summary mt-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="summary-card">
                      <h6>Total Classes</h6>
                      <h4>{schedule.length}</h4>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="summary-card">
                      <h6>Days with Classes</h6>
                      <h4>
                        {new Set(schedule.map((c) => c.scheduled_day)).size}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> No classes scheduled yet
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultySchedule;
