import { useState, useEffect } from "react";
import API from "../services/api";

function CourseRegistrations({ userId }) {
  const [registrations, setRegistrations] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prerequisites, setPrerequisites] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loadingPrereqs, setLoadingPrereqs] = useState({});

  useEffect(() => {
    fetchRegistrations();
    // Load previously selected courses from localStorage
    const saved = localStorage.getItem(`registrations_${userId}`);
    if (saved) {
      setSelectedCourses(JSON.parse(saved));
    }
  }, [userId]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/student/registrations/${userId}`);
      setRegistrations(res.data);

      // Initialize selected courses from API response or localStorage
      const saved = localStorage.getItem(`registrations_${userId}`);
      if (saved) {
        setSelectedCourses(JSON.parse(saved));
      } else {
        // Use API response to set defaults
        const initial = {};
        res.data.forEach(course => {
          initial[course.course_offering_id] = course.selected || false;
        });
        setSelectedCourses(initial);
      }
      setError("");
    } catch (err) {
      setError("Failed to load course registrations. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (courseOfferingId) => {
    setSelectedCourses({
      ...selectedCourses,
      [courseOfferingId]: !selectedCourses[courseOfferingId]
    });
  };

  const fetchPrerequisites = async (courseOfferingId) => {
    try {
      setLoadingPrereqs(prev => ({ ...prev, [courseOfferingId]: true }));
      const res = await API.get(`/course-offering/${courseOfferingId}/prerequisites`);
      setPrerequisites(prev => ({ ...prev, [courseOfferingId]: res.data }));
    } catch (err) {
      console.error(err);
      setPrerequisites(prev => ({ ...prev, [courseOfferingId]: { prerequisites: [] } }));
    } finally {
      setLoadingPrereqs(prev => ({ ...prev, [courseOfferingId]: false }));
    }
  };

  const toggleExpandCourse = (courseOfferingId) => {
    if (expandedCourse === courseOfferingId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseOfferingId);
      if (!prerequisites[courseOfferingId]) {
        fetchPrerequisites(courseOfferingId);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Submit each selected/deselected course
      for (const [courseOfferingId, selected] of Object.entries(selectedCourses)) {
        await API.post("/student/registration", {
          student_id: userId,
          course_offering_id: parseInt(courseOfferingId),
          selected: selected
        });
      }

      // Save to localStorage
      localStorage.setItem(`registrations_${userId}`, JSON.stringify(selectedCourses));

      setSuccess("Course registrations submitted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit registrations");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Course Registrations</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            ✓ {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
          </div>
        )}

        {registrations.length === 0 ? (
          <p className="text-muted">No courses available for registration.</p>
        ) : (
          <>
            <div className="alert alert-info" role="alert">
              <small>
                <strong style={{ color: "#ff6b6b" }}>■ Red border</strong> = Backlog course (retake required)
              </small>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th width="5%" className="text-center">#</th>
                    <th>Course Name</th>
                    <th>Faculty</th>
                    <th>Semester</th>
                    <th width="10%" className="text-center">
                      <i className="fas fa-info-circle"></i>
                    </th>
                    <th width="10%" className="text-center">
                      <i className="fas fa-check-square"></i> Select
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((course, index) => (
                    <div key={course.course_offering_id}>
                      <tr style={{
                        borderLeft: course.is_backlog ? "4px solid #ff6b6b" : "4px solid transparent"
                      }}>
                        <td className="text-center text-muted">{index + 1}</td>
                        <td>
                          <strong>{course.course_name}</strong>
                          {course.is_backlog && (
                            <span className="badge bg-danger ms-2">Backlog</span>
                          )}
                        </td>
                        <td>{course.faculty_name || "TBD"}</td>
                        <td>{course.semester || "N/A"}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => toggleExpandCourse(course.course_offering_id)}
                            title="View prerequisites"
                          >
                            <i className="fas fa-chevron-down"></i>
                          </button>
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedCourses[course.course_offering_id] || false}
                            onChange={() => handleCheckboxChange(course.course_offering_id)}
                            disabled={submitting}
                          />
                        </td>
                      </tr>
                      {expandedCourse === course.course_offering_id && (
                        <tr className="bg-light">
                          <td colSpan="6">
                            <div className="p-3">
                              <h6 className="mb-2">Prerequisites:</h6>
                              {loadingPrereqs[course.course_offering_id] ? (
                                <small className="text-muted">Loading prerequisites...</small>
                              ) : prerequisites[course.course_offering_id]?.prerequisites?.length === 0 ? (
                                <small className="text-muted">No prerequisites required</small>
                              ) : (
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered">
                                    <thead>
                                      <tr className="table-light">
                                        <th>Prerequisite Course</th>
                                        <th>Credits</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {prerequisites[course.course_offering_id]?.prerequisites?.map((prereq, idx) => (
                                        <tr key={idx}>
                                          <td>{prereq.course_name}</td>
                                          <td>{prereq.credits}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <p className="text-muted">
                <small>
                  {Object.values(selectedCourses).filter(Boolean).length} of{" "}
                  {registrations.length} courses selected
                </small>
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i> Submit Registrations
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CourseRegistrations;
