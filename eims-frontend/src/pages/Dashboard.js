import { useState, useEffect } from "react";
import StudentProfile from "../components/StudentProfile";
import CourseRegistrations from "../components/CourseRegistrations";
import Courses from "../components/Courses";
import FeeStatus from "../components/FeeStatus";
import Feedback from "../components/Feedback";
import CDC from "../components/CDC";
import Backlogs from "../components/Backlogs";
import ExamsDashboard from "../components/ExamsDashboard";
import SupplementaryExams from "../components/SupplementaryExams";
import Timetable from "../components/Timetable";
import LeaveRequest from "../components/LeaveRequest";
import API from "../services/api";


function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      window.location.href = "/";
      return;
    }
    setUserId(storedUserId);
    // Fetch student profile to get actual student_id
    API.get(`/student/profile/${storedUserId}`)
      .then((res) => {
        setStudentProfile(res.data);
      })
      .catch((err) => {
        setStudentProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">EIMS - Student Dashboard</span>
          <div className="d-flex">
            <span className="text-white me-3">Welcome, {userId}</span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-md-3">
            <div className="card shadow">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "profile" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <i className="fas fa-user me-2"></i> Student Profile
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "registrations" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("registrations")}
                  >
                    <i className="fas fa-clipboard me-2"></i> Course Registrations
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "courses" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("courses")}
                  >
                    <i className="fas fa-book me-2"></i> My Courses
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "fees" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("fees")}
                  >
                    <i className="fas fa-receipt me-2"></i> Fee Status & Payments
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "feedback" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("feedback")}
                  >
                    <i className="fas fa-comments me-2"></i> Course Feedback
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "cdc" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("cdc")}
                  >
                    <i className="fas fa-briefcase me-2"></i> Career Development (CDC)
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "backlogs" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("backlogs")}
                  >
                    <i className="fas fa-ban me-2"></i> Backlogs
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "exams" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("exams")}
                  >
                    <i className="fas fa-calendar-alt me-2"></i> Exams
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "supplementary" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("supplementary")}
                  >
                    <i className="fas fa-file-alt me-2"></i> Supplementary Exams
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "timetable" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("timetable")}
                  >
                    <i className="fas fa-calendar-week me-2"></i> Timetable
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "leave" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("leave")}
                  >
                    <i className="fas fa-calendar2-x me-2"></i> Leave Requests
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            {activeTab === "profile" && <StudentProfile userId={userId} />}
            {activeTab === "registrations" && <CourseRegistrations userId={userId} />}
            {activeTab === "courses" && <Courses userId={userId} />}
            {activeTab === "fees" && <FeeStatus userId={userId} />}
            {activeTab === "feedback" && <Feedback userId={userId} />}
            {activeTab === "cdc" && <CDC userId={userId} />}
            {activeTab === "backlogs" && <Backlogs userId={userId} />}
            {activeTab === "exams" && <ExamsDashboard userId={userId} />}
            {activeTab === "supplementary" && <SupplementaryExams userId={userId} />}
            {activeTab === "timetable" && <Timetable userId={userId} />}
            {activeTab === "leave" && studentProfile && (
              <LeaveRequest studentId={studentProfile.student_id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
