import React, { useState, useEffect, useContext, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { fetchMembers, updateMember, deleteMember, exportMembers, changePassword } from '../api/memberApi';
import MemberForm from './MemberForm';

const SIZE = 10;
const EMPTY = { id: null, name: '', address: '', birthDate: '', phone: '' };

const MemberList = () => {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [downOnOverlay, setDownOnOverlay] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMembers(searchName, page, SIZE);
      setMembers(data.content ?? data);
      setTotalPages(data.totalPages ?? 1);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('세션이 만료되었거나 다른 기기에서 로그인되었습니다. 다시 로그인해주세요.');
        logout();
      } else {
        setError('회원 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchName, page, logout]);

  // 300ms 디바운스: 타이핑 중 API 과도 호출 방지
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openEdit = (m) => {
    setForm({ id: m.id, name: m.name || '', address: m.address || '', birthDate: m.birthDate || '', phone: m.phone || '' });
    setModalOpen(true);
  };

  const openPwEdit = () => {
    setPwForm({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
    setPwModalOpen(true);
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setSaving(true);
      await changePassword(user.id, { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setPwModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMember(form.id, {
        name: form.name, address: form.address, birthDate: form.birthDate || null, phone: form.phone,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`'${m.name}' 회원을 삭제하시겠습니까?`)) return;
    try {
      await deleteMember(m.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleExport = async () => {
    try {
      await exportMembers();
    } catch (err) {
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  return (
    <section className="glass-panel list-card">
      <div className="list-head">
        <h1>{isAdmin ? '회원 목록' : '내 정보'}</h1>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input id="search-name" className="search" placeholder="이름으로 검색"
                   value={searchName} onChange={(e) => { setSearchName(e.target.value); setPage(0); }} />
            <button className="btn btn-primary btn-sm" onClick={handleExport}>엑셀 다운로드</button>
          </div>
        )}
      </div>
      {error && <div className="error-msg">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {isAdmin && <th>ID</th>}
              <th>아이디</th>
              <th className="col-address">주소</th>
              <th>생년월일</th>
              <th>전화번호</th>
              <th>역할</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="empty">불러오는 중...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="empty">회원이 없습니다.</td></tr>
            ) : members.map((m) => (
              <tr key={m.id}>
                {isAdmin && <td>{m.id}</td>}
                <td>{m.name}</td>
                <td className="col-address">{m.address || '-'}</td>
                <td>{m.birthDate ? format(parseISO(m.birthDate), 'yyyy.MM.dd') : '-'}</td>
                <td>{m.phone}</td>
                <td><em className={`role role-${m.role}`}>{m.role}</em></td>
                <td className="actions">
                  {m.id === user.id && (
                    <button className="btn btn-ghost btn-sm" onClick={openPwEdit}>비밀번호 변경</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>수정</button>
                  {isAdmin && m.id !== user.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)}>삭제</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button>
          <span>{page + 1} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>다음</button>
        </div>
      )}

      {modalOpen && (
        <div className="overlay"
             onMouseDown={(e) => setDownOnOverlay(e.target === e.currentTarget)}
             onMouseUp={(e) => { if (downOnOverlay && e.target === e.currentTarget) setModalOpen(false); setDownOnOverlay(false); }}>
          <div className="modal glass-panel">
            <h2>회원 정보 수정</h2>
            <MemberForm form={form} setForm={setForm} onSubmit={handleSave}
                        onCancel={() => setModalOpen(false)} saving={saving} />
          </div>
        </div>
      )}
      {pwModalOpen && (
        <div className="overlay"
             onMouseDown={(e) => setDownOnOverlay(e.target === e.currentTarget)}
             onMouseUp={(e) => { if (downOnOverlay && e.target === e.currentTarget) setPwModalOpen(false); setDownOnOverlay(false); }}>
          <div className="modal glass-panel">
            <h2>비밀번호 변경</h2>
            <form onSubmit={handlePwSave}>
              <label>현재 비밀번호
                <input type="password" value={pwForm.oldPassword} onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})} required />
              </label>
              <label>새 비밀번호
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} required />
              </label>
              <label>새 비밀번호 확인
                <input type="password" value={pwForm.newPasswordConfirm} onChange={e => setPwForm({...pwForm, newPasswordConfirm: e.target.value})} required />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setPwModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MemberList;
