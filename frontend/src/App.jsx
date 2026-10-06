import React, { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import MemberList from './components/MemberList';
import Login from './components/Login';
import Signup from './components/Signup';
import Landing from './components/Landing';
import { AuthContext } from './context/AuthContext';
import './index.css';

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon-wrap">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="logo-text">Member<span className="logo-highlight">Sync</span></span>
          </Link>
        </div>
        <nav className="header-actions">
          {user ? (
            <>
              <span className="user-badge">
                {user.name} <em className={`role role-${user.role}`}>{user.role}</em>
              </span>
              <button id="logout-btn" className="btn btn-ghost" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">로그인</Link>
              <Link to="/signup" className="btn btn-primary">회원가입</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/members" element={user ? <MemberList /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/members" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/members" replace /> : <Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
