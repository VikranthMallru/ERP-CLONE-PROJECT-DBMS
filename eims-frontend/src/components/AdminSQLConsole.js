import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminSQLConsole.css';

const AdminSQLConsole = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);

  const adminId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('role');

  // Check admin access on mount
  useEffect(() => {
    if (userRole !== 'Admin') {
      setError('Access Denied: Admin privileges required');
    }
  }, [userRole]);

  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      setQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (q) => {
    const updated = [q, ...queryHistory].slice(0, 5);
    setQueryHistory(updated);
    localStorage.setItem('queryHistory', JSON.stringify(updated));
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    if (userRole !== 'Admin') {
      setError('Admin privileges required to execute queries');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setResults(null);

      const startTime = performance.now();

      const response = await api.post('/admin/run-query', {
        query: query.trim(),
        admin_id: adminId
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (response.data.rows !== undefined || response.data.rowCount) {
        setResults(response.data.rows || []);
        const rowCount = response.data.rowCount || 0;
        setRowCount(rowCount);
        setExecutionTime(duration);
        saveToHistory(query.trim());
        const queryType = query.trim().toUpperCase().split(/\s+/)[0];
        const message = queryType === 'SELECT' 
          ? `Query executed successfully! ${rowCount} row(s) returned in ${duration}ms`
          : `Query executed successfully! ${rowCount} row(s) affected in ${duration}ms`;
        setSuccess(message);
      }
    } catch (err) {
      console.error('Query error:', err);
      setError(
        err.response?.data?.error || 'Failed to execute query. Check the console for details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (historicalQuery) => {
    setQuery(historicalQuery);
    setError('');
    setSuccess('');
  };

  const clearResults = () => {
    setResults(null);
    setError('');
    setSuccess('');
  };

  const exportToCSV = () => {
    if (!results || results.length === 0) return;

    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(','),
      ...results.map(row =>
        headers
          .map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `query_results_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (userRole !== 'Admin') {
    return (
      <div className="admin-console-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have the required admin privileges to access this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-console-container">
      <div className="console-header">
        <h2>
          <i className="bi bi-terminal"></i> Admin SQL Console
        </h2>
        <p className="text-muted">Execute SELECT queries safely with automatic validation</p>
      </div>

      <div className="console-layout">
        {/* Query Input Section */}
        <div className="query-section">
          <div className="section-header">
            <h5>SQL Query</h5>
            <span className="query-limit-notice">SELECT/INSERT/UPDATE/DELETE (Max 100 rows for SELECT)</span>
          </div>

          <textarea
            className="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM students; -- or INSERT/UPDATE/DELETE queries"
            disabled={loading}
            rows={10}
          />

          <div className="query-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={executeQuery}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Executing...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill"></i> Run Query
                </>
              )}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setQuery('')}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i> Clear
            </button>
          </div>

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="query-history">
              <h6>Recent Queries</h6>
              <div className="history-list">
                {queryHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="history-item"
                    onClick={() => loadFromHistory(hist)}
                    title="Click to load"
                  >
                    <span className="history-text">
                      {hist.substring(0, 50)}
                      {hist.length > 50 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="results-section">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <h5>
                <i className="bi bi-exclamation-circle"></i> Query Error
              </h5>
              <p className="mb-0">{error}</p>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle"></i> {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess('')}
              ></button>
            </div>
          )}

          {results && results.length > 0 ? (
            <div className="results-container">
              <div className="results-header">
                <div className="results-info">
                  <span className="badge bg-info">
                    {rowCount} rows • {executionTime}ms
                  </span>
                </div>
                <div className="results-actions">
                  <button className="btn btn-sm btn-outline-primary" onClick={exportToCSV}>
                    <i className="bi bi-download"></i> Export CSV
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={clearResults}>
                    <i className="bi bi-x-circle"></i> Clear
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      {results.length > 0 &&
                        Object.keys(results[0]).map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {Object.values(row).map((value, colIdx) => (
                          <td key={colIdx} className="result-cell">
                            {value === null ? (
                              <span className="text-muted">NULL</span>
                            ) : typeof value === 'boolean' ? (
                              <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
                                {value ? 'true' : 'false'}
                              </span>
                            ) : typeof value === 'object' ? (
                              <code>{JSON.stringify(value)}</code>
                            ) : (
                              String(value)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {results.length === 100 && (
                <div className="alert alert-info mt-3">
                  <small>
                    <i className="bi bi-info-circle"></i> Results limited to 100 rows for
                    performance
                  </small>
                </div>
              )}
            </div>
          ) : results === null ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-database"></i>
              </div>
              <p>Execute a query to see results here</p>
            </div>
          ) : (
            <div className="alert alert-info">
              <strong>No results found</strong> - The query executed successfully but returned no
              rows.
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="alert alert-warning mb-0">
          <h6>
            <i className="bi bi-shield-exclamation"></i> Security & Compliance
          </h6>
          <ul className="mb-0 mt-2">
            <li><strong>Allowed queries:</strong> SELECT, INSERT, UPDATE, DELETE</li>
            <li><strong>Blocked operations:</strong> DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE</li>
            <li>Query execution timeout: 5 seconds</li>
            <li>SELECT queries limited to 100 rows maximum</li>
            <li>All queries are logged with timestamp and admin ID for audit trail</li>
            <li>Trailing semicolons are optional (auto-removed if present)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSQLConsole;
