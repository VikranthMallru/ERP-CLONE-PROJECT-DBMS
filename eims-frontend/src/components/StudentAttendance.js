import { useEffect, useState } from "react";
import API from "../services/api";

function StudentAttendance({ userId }) {
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/student/${userId}/attendance`);
        setAttendanceRows(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [userId]);

  const normalizedRows = attendanceRows.map((row) => {
    const totalPresent = Number(row.total_present) || 0;
    const totalAbsent = Number(row.total_absent) || 0;
    const totalClasses = totalPresent + totalAbsent;
    const attendancePercentage = totalClasses > 0
      ? ((totalPresent / totalClasses) * 100).toFixed(2)
      : "0.00";

    return {
      ...row,
      totalPresent,
      totalAbsent,
      totalClasses,
      attendancePercentage,
    };
  });

  const overallClasses = normalizedRows.reduce(
    (sum, row) => sum + row.totalClasses,
    0
  );
  const overallPresent = normalizedRows.reduce(
    (sum, row) => sum + row.totalPresent,
    0
  );
  const overallPercentage = overallClasses > 0
    ? ((overallPresent / overallClasses) * 100).toFixed(2)
    : "0.00";

  const getAttendanceBadge = (percentage) => {
    const numericPercentage = Number(percentage);

    if (numericPercentage >= 75) {
      return <span className="badge bg-success">Good Standing</span>;
    }

    if (numericPercentage >= 60) {
      return <span className="badge bg-warning text-dark">Needs Attention</span>;
    }

    return <span className="badge bg-danger">Low Attendance</span>;
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Attendance Dashboard</h5>
        <span className="badge bg-light text-primary">Current Semester</span>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {normalizedRows.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No attendance records are available for your courses yet.
          </p>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="alert alert-primary h-100 mb-0">
                  <strong>Total Courses:</strong>
                  <div className="fs-4 mt-1">{normalizedRows.length}</div>
                </div>
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="alert alert-info h-100 mb-0">
                  <strong>Total Classes Counted:</strong>
                  <div className="fs-4 mt-1">{overallClasses}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className={`alert h-100 mb-0 ${Number(overallPercentage) >= 75 ? "alert-success" : "alert-warning"}`}>
                  <strong>Overall Attendance:</strong>
                  <div className="fs-4 mt-1">{overallPercentage}%</div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Total Classes</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedRows.map((row, index) => (
                    <tr key={`${row.course_name}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{row.course_name}</strong>
                      </td>
                      <td>{row.totalPresent}</td>
                      <td>{row.totalAbsent}</td>
                      <td>{row.totalClasses}</td>
                      <td>
                        <span className="fw-semibold">{row.attendancePercentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentAttendance;