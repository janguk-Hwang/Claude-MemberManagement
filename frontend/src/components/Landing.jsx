import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Landing() {
  const { user } = useContext(AuthContext);

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">최고의</span> 회원 관리 시스템
          </h1>
          <p className="hero-subtitle">
            더 이상 복잡한 시스템에 얽매이지 마세요. 아름답고 직관적인 UI로 모든 회원을 한곳에서 효율적으로 관리하세요.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <Link to="/members" className="btn btn-primary btn-lg">
                대시보드로 이동
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  무료로 시작하기
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card glass-panel">
          <div className="feature-icon">✨</div>
          <h3>아름다운 디자인</h3>
          <p>사용자 경험을 극대화하는 모던한 Glassmorphism UI가 적용되었습니다.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">⚡️</div>
          <h3>빠른 성능</h3>
          <p>React 19와 Vite 기반으로 눈 깜짝할 사이에 페이지가 전환됩니다.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">🔒</div>
          <h3>강력한 보안</h3>
          <p>JWT 토큰과 비밀번호 암호화를 통해 데이터를 안전하게 보호합니다.</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
