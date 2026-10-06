import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { checkName, signup } from '../api/memberApi';
import { formatPhone, buildAddress } from './MemberForm';

const Signup = () => {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [address, setAddress] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [nameChecked, setNameChecked] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckName = async () => {
    if (!name.trim()) return alert('아이디를 입력해주세요.');
    try {
      const ok = await checkName(name.trim());
      alert(ok ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
      setNameChecked(ok);
    } catch {
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!nameChecked) return setError('아이디 중복 확인을 해주세요.');
    if (password !== passwordRepeat) return setError('비밀번호가 일치하지 않습니다.');
    let birthDate = null;
    if (birthYear || birthMonth || birthDay) {
      if (!(birthYear && birthMonth && birthDay)) return setError('생년월일을 모두 선택해주세요.');
      birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    }
    try {
      await signup({ name: name.trim(), password, address, birthDate, phone, role });
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  return (
    <div className="auth-card glass-panel">
      <h1>회원가입</h1>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>아이디
          <div className="row">
            <input id="signup-name" value={name} required
                   onChange={(e) => { setName(e.target.value); setNameChecked(false); }} />
            <button type="button" id="check-name" className={`btn ${nameChecked ? 'btn-ok' : 'btn-ghost'}`}
                    onClick={handleCheckName}>{nameChecked ? '확인됨 ✓' : '중복확인'}</button>
          </div>
        </label>
        <label>비밀번호
          <input id="signup-password" type="password" value={password} required
                 onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>비밀번호 확인
          <input id="signup-password2" type="password" value={passwordRepeat} required
                 onChange={(e) => setPasswordRepeat(e.target.value)} />
        </label>
        <label>주소
          <div className="row">
            <input id="signup-address" value={address} readOnly placeholder="주소 검색을 눌러주세요" />
            <button type="button" className="btn btn-ghost" onClick={() => setPostcodeOpen((o) => !o)}>주소 검색</button>
          </div>
        </label>
        {postcodeOpen && (
          <div className="postcode-box">
            <DaumPostcode onComplete={(d) => { setAddress(buildAddress(d)); setPostcodeOpen(false); }} />
          </div>
        )}
        <label>생년월일
          <div className="row">
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
              <option value="">연</option>
              {range(currentYear - 100, currentYear).reverse().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
              <option value="">월</option>
              {range(1, 12).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
              <option value="">일</option>
              {range(1, 31).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </label>
        <label>전화번호
          <input id="signup-phone" value={phone} placeholder="010-0000-0000" required
                 onChange={(e) => setPhone(formatPhone(e.target.value))} />
        </label>
        <label>역할
          <select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <button id="signup-submit" className="btn btn-primary btn-block">가입하기</button>
      </form>
      <p className="auth-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
    </div>
  );
};

export default Signup;
