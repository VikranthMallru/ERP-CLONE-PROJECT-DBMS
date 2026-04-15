import { useState, useEffect } from "react";
import API from "../services/api";

function Courses({ userId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/student/courses/${userId}`);
      setCourses(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load courses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">My Courses</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {courses.length === 0 ? (
          <p className="text-muted text-center py-4">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <>
            <p className="text-muted mb-3">
              Total Courses: <strong>{courses.length}</strong>
            </p>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Course Code</th>
                    <th>Faculty</th>
                    <th>Semester</th>
                    <th>Credits</th>
                    {courses.some(c => c.grade) && <th>Grade</th>}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={course.course_id}>
                      <td>
                        <span className="badge bg-primary">{index + 1}</span>
                      </td>
                      <td className="fw-bold">{course.course_name}</td>
                      <td>
                        <code>{course.course_id}</code>
                      </td>
                      <td>{course.faculty_name || "Not Assigned"}</td>
                      <td>
                        <span className="badge bg-info">{course.semester} Sem</span>
                      </td>
                      <td>{course.credits || "N/A"}</td>
                      {courses.some(c => c.grade) && (
                        <td>
                          {course.grade ? (
                            <span className="badge bg-success">{course.grade}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      )}
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

export default Courses;
