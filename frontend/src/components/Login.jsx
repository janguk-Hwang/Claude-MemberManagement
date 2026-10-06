import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(name, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card glass-panel">
      <h1>로그인</h1>
      <p className="subtitle">계정으로 로그인하여 회원을 관리하세요.</p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>아이디
          <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>비밀번호
          <input id="login-password" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button id="login-submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="auth-link">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
    </div>
  );
};

export default Login;
