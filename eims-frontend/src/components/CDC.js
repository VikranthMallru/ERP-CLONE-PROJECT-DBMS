import { useState, useEffect } from "react";
import API from "../services/api";

function CDC({ userId }) {
  const [cdcData, setCdcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("eligibility");

  useEffect(() => {
    fetchCDCData();
  }, [userId]);

  const fetchCDCData = async () => {
    try {
      setLoading(true);
      const [eligRes, appRes, oppRes] = await Promise.all([
        API.get(`/student/${userId}/cdc/eligibility`).catch(() => ({ data: {} })),
        API.get(`/student/${userId}/cdc/applications`).catch(() => ({ data: { applications: [] } })),
        API.get(`/cdc/available-opportunities`).catch(() => ({ data: { opportunities: [] } }))
      ]);

      setCdcData({
        eligibility: eligRes.data,
        applications: appRes.data.applications || [],
        opportunities: oppRes.data.opportunities || []
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load CDC data");
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
        <h5 className="mb-0">Career Development Cell (CDC)</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "eligibility" ? "active" : ""}`}
              onClick={() => setActiveTab("eligibility")}
              type="button"
            >
              Eligibility
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
              type="button"
            >
              My Applications
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "opportunities" ? "active" : ""}`}
              onClick={() => setActiveTab("opportunities")}
              type="button"
            >
              Available Opportunities
            </button>
          </li>
        </ul>

        {/* Eligibility Tab */}
        {activeTab === "eligibility" && (
          <div>
            <div className="alert alert-info" role="alert">
              ℹ️ CDC features are coming soon. Check back later for eligibility information and placement opportunities.
            </div>
            <div className="card bg-light">
              <div className="card-body">
                <h6>Eligibility Status</h6>
                <p className="text-muted">Features under development</p>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            <div className="alert alert-info" role="alert">
              ℹ️ No applications submitted yet. Check back when CDC features are available.
            </div>
            {cdcData?.applications.length === 0 ? (
              <p className="text-muted">You have not applied to any opportunities yet</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Company/Department</th>
                      <th>Application Status</th>
                      <th>Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdcData?.applications.map((app, index) => (
                      <tr key={index}>
                        <td>{app.company_name || "N/A"}</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                        <td>{app.applied_date || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === "opportunities" && (
          <div>
            <div className="alert alert-info" role="alert">
              ℹ️ No opportunities available yet. Check back soon!
            </div>
            {cdcData?.opportunities.length === 0 ? (
              <p className="text-muted">No opportunities available at this time</p>
            ) : (
              <div className="row">
                {cdcData?.opportunities.map((opp, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">{opp.company_name}</h6>
                        <p className="card-text">{opp.description}</p>
                        <button className="btn btn-sm btn-primary">Apply Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CDC;
