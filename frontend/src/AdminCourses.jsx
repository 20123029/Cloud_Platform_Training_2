import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AdminCourses({ courses, onBack, loadData }) {
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ course_name: '', year: 1, course_type: '講義', target_track: '' });

    const startEdit = (c) => {
        setEditingId(c.id);
        setForm({ course_name: c.course_name, year: c.year, course_type: c.course_type, target_track: c.target_track });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_URL}/admin/courses/update/${editingId}` : `${API_URL}/admin/courses/create`;
        try {
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert(editingId ? '講義を修正しました' : '新規講義マスタを登録しました');
                setForm({ course_name: '', year: 1, course_type: '講義', target_track: '' });
                setEditingId(null);
                loadData();
            }
        } catch (e) { alert('エラーが発生しました'); }
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '1100px', margin: '0 auto', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                <button onClick={onBack} style={{ marginRight: '2rem', padding: '0.5rem 1rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>戻る</button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>カリキュラム講義マスタ管理</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem' }}>
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? '講義マスタの詳細修正' : 'カリキュラム科目の新設'}</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>講義名</label>
                        <input type="text" value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} placeholder="例: 量子力学演習基礎" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>配当対象年次</label>
                            <select value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                                <option value="1">1年次</option><option value="2">2年次</option><option value="3">3年次</option><option value="4">4年次</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>授業形態種別</label>
                            <select value={form.course_type} onChange={e => setForm({ ...form, course_type: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                                <option value="講義">講義</option><option value="演習">演習</option><option value="実習">実習</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>該当専門コース / 領域名称</label>
                        <input type="text" value={form.target_track} onChange={e => setForm({ ...form, target_track: e.target.value })} placeholder="例: 先端科学システム、バイオ応用情報" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ flex: 1, padding: '0.85rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'データを更新' : 'マスタへ追加'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ course_name: '', year: 1, course_type: '講義', target_track: '' }); }} style={{ padding: '0.85rem', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>キャンセル</button>}
                    </div>
                </form>

                <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>提供カリキュラム一覧</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>講義名</th>
                                <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>年次</th>
                                <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>種別</th>
                                <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>コース</th>
                                <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(co => (
                                <tr key={co.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{co.course_name}</td>
                                    <td style={{ padding: '1rem 0.5rem', color: '#475569' }}>{co.year}年</td>
                                    <td style={{ padding: '1rem 0.5rem', color: '#475569' }}>{co.course_type}</td>
                                    <td style={{ padding: '1rem 0.5rem', color: '#475569' }}>{co.target_track}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}><button onClick={() => startEdit(co)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>修正</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}