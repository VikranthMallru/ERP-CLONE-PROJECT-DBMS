import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CourseManagement from '../components/faculty/CourseManagement';
import RegistrationApprovals from '../components/faculty/RegistrationApprovals';
import AttendanceManagement from '../components/faculty/AttendanceManagement';
import GradeManagement from '../components/faculty/GradeManagement';
import LeaveApprovals from '../components/faculty/LeaveApprovals';
import AdvisoryStudents from '../components/faculty/AdvisoryStudents';
import CourseFeedback from '../components/faculty/CourseFeedback';
import RoomBookings from '../components/faculty/RoomBookings';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [facultyName, setFacultyName] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(false);
  const facultyId = localStorage.getItem('user_id');
  const role = localStorage.getUser_info?.role || localStorage.getItem('role');

  // Verify faculty access
  useEffect(() => {
    if (role !== 'Faculty') {
      window.location.href = '/login';
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch faculty info
      const facultyRes = await api.get(`/faculty/${facultyId}`);
      setFacultyName(facultyRes.data.name);

      // Fetch courses count
      const coursesRes = await api.get(`/faculty/${facultyId}/current-courses`);
      const studentCountRes = await api.get(`/faculty/${facultyId}/total-students`);
      const approvalsRes = await api.get(`/faculty/pending/${facultyId}`);
      const leavesRes = await api.get(`/faculty/${facultyId}/leave-requests`);

      setStats({
        totalCourses: coursesRes.data.length,
        totalStudents: studentCountRes.data.total || 0,
        pendingApprovals: approvalsRes.data.length,
        pendingLeaves: leavesRes.data.filter((l) => l.status === 'pending').length
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Faculty Dashboard</h1>
          <p className="subtitle">Welcome, {facultyName || 'Faculty Member'}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <div className="stat-card stat-courses">
              <div className="stat-icon">
                <i className="bi bi-book"></i>
              </div>
              <div className="stat-content">
                <h6>Total Courses</h6>
                <h3>{loading ? '-' : stats.totalCourses}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card stat-students">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
                <h6>Total Students</h6>
                <h3>{loading ? '-' : stats.totalStudents}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card stat-approvals">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-content">
                <h6>Pending Approvals</h6>
                <h3>{loading ? '-' : stats.pendingApprovals}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card stat-leaves">
              <div className="stat-icon">
                <i className="bi bi-calendar2-x"></i>
              </div>
              <div className="stat-content">
                <h6>Pending Leaves</h6>
                <h3>{loading ? '-' : stats.pendingLeaves}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {[
              { id: 'overview', label: 'Overview', icon: 'bi-house' },
              { id: 'courses', label: 'Course Management', icon: 'bi-book' },
              { id: 'approvals', label: 'Registration Approvals', icon: 'bi-check-circle' },
              { id: 'attendance', label: 'Attendance', icon: 'bi-calendar-check' },
              { id: 'grades', label: 'Grades', icon: 'bi-graph-up' },
              { id: 'leaves', label: 'Leave Approvals', icon: 'bi-calendar2-x' },
              { id: 'advisory', label: 'Advisory Students', icon: 'bi-person-check' },
              { id: 'feedback', label: 'Course Feedback', icon: 'bi-chat-left-quote' },
              { id: 'rooms', label: 'Room Bookings', icon: 'bi-door-closed' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h3>Dashboard Overview</h3>
              <div className="overview-content">
                <div className="card">
                  <div className="card-body">
                    <h5>Quick Actions</h5>
                    <div className="quick-actions">
                      <button
                        className="quick-action-btn"
                        onClick={() => setActiveTab('attendance')}
                      >
                        <i className="bi bi-calendar-check"></i>
                        <span>Mark Attendance</span>
                      </button>
                      <button
                        className="quick-action-btn"
                        onClick={() => setActiveTab('grades')}
                      >
                        <i className="bi bi-graph-up"></i>
                        <span>Upload Grades</span>
                      </button>
                      <button
                        className="quick-action-btn"
                        onClick={() => setActiveTab('approvals')}
                      >
                        <i className="bi bi-check-circle"></i>
                        <span>Approve Requests</span>
                      </button>
                      <button
                        className="quick-action-btn"
                        onClick={() => setActiveTab('rooms')}
                      >
                        <i className="bi bi-door-closed"></i>
                        <span>Book Rooms</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card mt-4">
                  <div className="card-body">
                    <h5>Recent Tasks</h5>
                    <p className="text-muted">
                      You have {stats.pendingApprovals} pending student registration approvals and{' '}
                      {stats.pendingLeaves} pending leave requests.
                    </p>
                    <div className="task-suggestions">
                      {stats.pendingApprovals > 0 && (
                        <div className="alert alert-info" role="alert">
                          <i className="bi bi-info-circle"></i> {stats.pendingApprovals} student(s)
                          waiting for course registration approval
                        </div>
                      )}
                      {stats.pendingLeaves > 0 && (
                        <div className="alert alert-warning" role="alert">
                          <i className="bi bi-exclamation-triangle"></i> {stats.pendingLeaves} leave
                          request(s) awaiting approval
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'approvals' && <RegistrationApprovals />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'grades' && <GradeManagement />}
          {activeTab === 'leaves' && <LeaveApprovals />}
          {activeTab === 'advisory' && <AdvisoryStudents />}
          {activeTab === 'feedback' && <CourseFeedback />}
          {activeTab === 'rooms' && <RoomBookings />}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
