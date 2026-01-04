import { useState } from 'react';
import { codeforcesStatsAPI } from '../utils/api';
import '../styles/CodeforcesStats.css';

export default function CodeforcesStats() {
    const [handle, setHandle] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!handle.trim()) {
            setError('Please enter a Codeforces handle');
            return;
        }

        setLoading(true);
        setError('');
        setStats(null);

        try {
            const response = await codeforcesStatsAPI.analyzeStats(handle);
            setStats(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching stats');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="codeforces-stats">
            <div className="stats-header">
                <h1>Codeforces Stats Analyzer</h1>
                <p>Analyze your contest participation and upsolve patterns</p>
            </div>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Enter Codeforces handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button onClick={handleAnalyze} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {stats && (
                <div className="stats-container">
                    <div className="summary-cards">
                        <div className="card">
                            <h3>Total Contests</h3>
                            <p className="value">{stats.summary.totalContests}</p>
                        </div>
                        <div className="card">
                            <h3>Solved During Contest</h3>
                            <p className="value">{stats.summary.totalSolvedDuring}</p>
                        </div>
                        <div className="card">
                            <h3>Upsolved Problems</h3>
                            <p className="value">{stats.summary.totalUpsolved}</p>
                        </div>
                    </div>

                    <div className="contests-section">
                        <h2>Contest Breakdown</h2>
                        <table className="contests-table">
                            <thead>
                                <tr>
                                    <th>Contest Name</th>
                                    <th>During Contest</th>
                                    <th>Upsolved</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.contestStats.map((contest) => (
                                    <tr key={contest.contestId}>
                                        <td>{contest.contestName}</td>
                                        <td>{contest.solvedDuring}</td>
                                        <td>{contest.solvedAfter}</td>
                                        <td>{contest.totalSolved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {stats.upsolveQueue.length > 0 && (
                        <div className="upsolve-section">
                            <h2>Upsolve Queue</h2>
                            <table className="upsolve-table">
                                <thead>
                                    <tr>
                                        <th>Contest</th>
                                        <th>Problem</th>
                                        <th>Solved At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.upsolveQueue.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.contestName}</td>
                                            <td>{item.problemIndex}</td>
                                            <td>{new Date(item.solvedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
