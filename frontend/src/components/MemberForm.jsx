import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

export const formatPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
};

export const buildAddress = (data) => {
  let full = data.address;
  let extra = '';
  if (data.addressType === 'R') {
    if (data.bname) extra += data.bname;
    if (data.buildingName) extra += extra ? `, ${data.buildingName}` : data.buildingName;
    full += extra ? ` (${extra})` : '';
  }
  return full;
};

/** 회원 수정 모달용 폼 */
const MemberForm = ({ form, setForm, onSubmit, onCancel, saving }) => {
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit}>
      <label>아이디
        <input id="edit-name" value={form.name} onChange={set('name')} required />
      </label>
      <label>주소
        <div className="row">
          <input id="edit-address" value={form.address} readOnly placeholder="주소 검색을 눌러주세요" />
          <button type="button" className="btn btn-ghost" onClick={() => setPostcodeOpen((o) => !o)}>
            주소 검색
          </button>
        </div>
      </label>
      {postcodeOpen && (
        <div className="postcode-box">
          <DaumPostcode onComplete={(d) => { setForm({ ...form, address: buildAddress(d) }); setPostcodeOpen(false); }} />
        </div>
      )}
      <label>생년월일
        <input id="edit-birth" type="date" value={form.birthDate} onChange={set('birthDate')} />
      </label>
      <label>전화번호
        <input id="edit-phone" value={form.phone}
               onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} required />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>취소</button>
        <button id="edit-save" className="btn btn-primary" disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
      </div>
    </form>
  );
};

export default MemberForm;
