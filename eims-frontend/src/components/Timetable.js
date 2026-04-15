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
      console.log("Raw API data:", res.data);
      
      // Normalize times to HH:MM format (first 5 chars)
      const normalizedSchedule = res.data.map(item => {
        const start = item.start_time ? item.start_time.substring(0, 5) : "";
        const end = item.end_time ? item.end_time.substring(0, 5) : "";
        console.log(`Normalizing: ${item.course_name} - "${item.start_time}" -> "${start}"`);
        return {
          ...item,
          start_time: start,
          end_time: end
        };
      });
      
      console.log("=== NORMALIZED SCHEDULE ===");
      normalizedSchedule.forEach(c => {
        console.log(`${c.course_name}: ${c.start_time} - ${c.end_time} on ${c.scheduled_day}`);
      });
      
      setTimetable(normalizedSchedule);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const formatTime = (time) => {
    if (!time) return "";
    const parts = time.toString().split(':');
    return `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`;
  };

  // Generate 30-minute time slots from 8:00 AM to 6:00 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const nextMinute = minute === 0 ? 30 : 0;
        const nextHour = minute === 0 ? hour : hour + 1;
        const end = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
        slots.push({ start, end, display: `${start} - ${end}` });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getRowSpan = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;
    
    return Math.max(1, Math.ceil(durationMinutes / 30));
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  const normalizeDay = (day) => {
    if (day === null || day === undefined) return "";
    const dayStr = day.toString().toLowerCase().trim();
    
    console.log("Raw day value:", day, "Type:", typeof day, "String:", dayStr);
    
    // Handle number format (0-4)
    if (!isNaN(dayStr) && dayStr !== "") {
      const dayNum = parseInt(dayStr);
      if (dayNum >= 0 && dayNum < days.length) {
        console.log("Matched as index:", dayNum, "->", days[dayNum]);
        return days[dayNum];
      }
    }
    
    // Handle exact day name matches
    const dayNames = {
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday"
    };
    
    if (dayNames[dayStr]) {
      console.log("Matched exact name:", dayNames[dayStr]);
      return dayNames[dayStr];
    }
    
    // Check if day name appears in string
    for (let d of days) {
      if (dayStr.includes(d.toLowerCase())) {
        console.log("Matched substring:", d);
        return d;
      }
    }
    
    console.log("NO MATCH for day:", day);
    return "";
  };

  // Normalize and group classes by day
  const classesByDay = {};
  days.forEach(day => {
    classesByDay[day] = [];
  });

  console.log("Total timetable entries:", timetable.length);
  
  timetable.forEach((cls, idx) => {
    console.log(`Entry ${idx}:`, {
      course_name: cls.course_name,
      scheduled_day: cls.scheduled_day,
      start_time: cls.start_time,
      end_time: cls.end_time
    });
    
    const normalizedDay = normalizeDay(cls.scheduled_day);
    if (normalizedDay && classesByDay[normalizedDay]) {
      classesByDay[normalizedDay].push(cls);
      console.log(`✓ Added "${cls.course_name}" to ${normalizedDay} at ${cls.start_time}-${cls.end_time}`);
    } else {
      console.log(`✗ Not added - normalized day: "${normalizedDay}"`);
    }
  });

  console.log("=== FINAL Classes by Day ===");
  days.forEach(day => {
    console.log(`${day}: ${classesByDay[day].length} classes -`, classesByDay[day].map(c => `${c.course_name} (${c.start_time})`));
  });

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-calendar-week me-2"></i> My Timetable
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {timetable.length === 0 ? (
          <div className="alert alert-info mb-0" role="alert">
            <i className="fas fa-calendar-check me-2"></i> No classes scheduled for this week
          </div>
        ) : (
          <div className="timetable-container">
            {/* Summary Cards */}
            <div className="schedule-summary mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="summary-card">
                    <h6>Total Classes</h6>
                    <h4>{timetable.length}</h4>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="summary-card">
                    <h6>Days with Classes</h6>
                    <h4>
                      {new Set(timetable.map((c) => normalizeDay(c.scheduled_day))).size}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Timetable */}
            <div className="table-responsive">
              <table className="timetable">
                <thead>
                  <tr>
                    <th className="time-header">Time</th>
                    {days.map((day) => (
                      <th key={day} className="day-header">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIdx) => {
                    const renderedCells = new Set();
                    
                    // Log for debugging - first few slots
                    if (slotIdx < 3) {
                      console.log(`\n=== Checking Slot ${slotIdx}: "${slot.start}" ===`);
                      days.forEach(day => {
                        const classesForDay = classesByDay[day];
                        const startingClass = classesForDay.find(c => c.start_time === slot.start);
                        console.log(`  ${day}: ${classesForDay.length} classes, starting at ${slot.start}? ${startingClass ? startingClass.course_name : 'NO'}`);
                      });
                    }

                    return (
                      <tr key={slotIdx}>
                        <td className="time-cell">{slot.display}</td>
                        {days.map((day) => {
                          const cellKey = `${day}-${slotIdx}`;
                          
                          // Skip if already covered by rowspan
                          if (renderedCells.has(cellKey)) {
                            return null;
                          }

                          // Find class starting at this time for this day
                          const classAtThisTime = classesByDay[day].find(
                            (cls) => cls.start_time === slot.start
                          );

                          if (classAtThisTime) {
                            const rowSpan = getRowSpan(classAtThisTime.start_time, classAtThisTime.end_time);
                            
                            // Mark future slots as rendered for this class
                            for (let i = 0; i < rowSpan; i++) {
                              renderedCells.add(`${day}-${slotIdx + i}`);
                            }

                            return (
                              <td
                                key={cellKey}
                                className="schedule-cell"
                                rowSpan={rowSpan}
                              >
                                <div className="class-content">
                                  <div className="course-name">{classAtThisTime.course_name}</div>
                                  <div className="location-info">
                                    {classAtThisTime.building_name} -  {classAtThisTime.room_number}
                                  </div>
                                  <div className="time-info">
                                    {classAtThisTime.start_time} - {classAtThisTime.end_time}
                                  </div>
                                </div>
                              </td>
                            );
                          } else {
                            // Check if covered by previous class
                            const isCovered = classesByDay[day].some((cls) => {
                              const [startHour, startMin] = cls.start_time.split(':').map(Number);
                              const [endHour, endMin] = cls.end_time.split(':').map(Number);
                              const [slotHour, slotMin] = slot.start.split(':').map(Number);
                              
                              const classStart = startHour * 60 + startMin;
                              const classEnd = endHour * 60 + endMin;
                              const slotTime = slotHour * 60 + slotMin;
                              
                              return slotTime > classStart && slotTime < classEnd;
                            });

                            if (!isCovered) {
                              return <td key={cellKey} className="empty-cell"></td>;
                            }
                            return null;
                          }
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timetable;
