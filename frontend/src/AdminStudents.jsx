import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AdminStudents({ students, onBack, loadData }) {
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ student_number: '', name: '', email: '' });

    const startEdit = (st) => {
        setEditingId(st.id);
        setForm({ student_number: st.student_number, name: st.name, email: st.email || '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_URL}/admin/students/update/${editingId}` : `${API_URL}/admin/students/create`;
        try {
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert(editingId ? '学生アカウント情報を修正しました' : '学生データを新規登録しました');
                setForm({ student_number: '', name: '', email: '' });
                setEditingId(null);
                loadData();
            }
        } catch (e) { alert('エラーが発生しました'); }
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '1100px', margin: '0 auto', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                <button onClick={onBack} style={{ marginRight: '2rem', padding: '0.5rem 1rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>戻る</button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>所属学生情報 管理</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem' }}>
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? '学生情報の修正・変更' : '新規学生の登録'}</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>学籍番号</label>
                        <input type="text" value={form.student_number} onChange={e => setForm({ ...form, student_number: e.target.value })} placeholder="例: S2026999" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>氏名</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="例: 鈴木一郎" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>大学連絡用メールアドレス</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="例: suzuki@univ.ac.jp" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ flex: 1, padding: '0.85rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{editingId ? '学生データを更新' : 'アカウントを登録'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ student_number: '', name: '', email: '' }); }} style={{ padding: '0.85rem', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>キャンセル</button>}
                    </div>
                </form>

                <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>在籍学生名簿一覧</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {students.map(st => (
                            <div key={st.id} style={{ border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginRight: '0.75rem' }}>{st.student_number}</span>
                                        <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>{st.name}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{st.email || 'メール未設定'}</div>
                                </div>
                                <button onClick={() => startEdit(st)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>修正</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}