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
            <div className="row">
              {courses.map((course, index) => (
                <div key={course.course_id} className="col-md-6 mb-3">
                  <div className="card border-left-primary shadow h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-primary"># {index + 1}</span>
                        <span className="badge bg-info">{course.semester} Sem</span>
                      </div>
                      <h6 className="card-title mb-2">{course.course_name}</h6>
                      <p className="mb-2">
                        <small>
                          <strong>Course Code:</strong> {course.course_id}
                        </small>
                      </p>
                      <p className="mb-2">
                        <small>
                          <strong>Faculty:</strong> {course.faculty_name || "Not Assigned"}
                        </small>
                      </p>
                      <p className="mb-0">
                        <small>
                          <strong>Credits:</strong> {course.credits || "N/A"}
                        </small>
                      </p>
                      {course.grade && (
                        <p className="mt-2 mb-0">
                          <small>
                            <strong>Grade:</strong>{" "}
                            <span className="badge bg-success">{course.grade}</span>
                          </small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Courses;
