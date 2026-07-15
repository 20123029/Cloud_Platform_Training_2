import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AdminCompanies({ companies, coursesMaster, onBack, loadData }) {
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ company_name: '', capacity: 1, location: '', business_domain: '', internship_description: '', required_course_ids: [] });

    const startEdit = (cp) => {
        setEditingId(cp.id);
        setForm({
            company_name: cp.company_name, capacity: cp.capacity, location: cp.location,
            business_domain: cp.business_domain, internship_description: cp.internship_description,
            required_course_ids: cp.required_course_ids || []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_URL}/companies/update/${editingId}` : `${API_URL}/companies/create`;
        try {
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert(editingId ? '企業情報を修正しました' : '企業情報を新規登録しました');
                setForm({ company_name: '', capacity: 1, location: '', business_domain: '', internship_description: '', required_course_ids: [] });
                setEditingId(null);
                loadData();
            }
        } catch (e) { alert('通信エラーが発生しました'); }
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '1100px', margin: '0 auto', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                <button onClick={onBack} style={{ marginRight: '2rem', padding: '0.5rem 1rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>戻る</button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>実習先企業情報 管理</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? '企業情報の修正・編集' : '新規企業アカウントの登録'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>企業名</label>
                            <input type="text" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>受入定員数 (名)</label>
                            <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>勤務実習エリア</label>
                            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>ビジネス領域</label>
                            <input type="text" value={form.business_domain} onChange={e => setForm({ ...form, business_domain: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>インターンシップ実習概要</label>
                        <textarea value={form.internship_description} onChange={e => setForm({ ...form, internship_description: e.target.value })} style={{ width: '100%', height: '100px', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>推奨・必須とする学生の履修要件科目</label>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                            {coursesMaster.map(c => (
                                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', color: '#0f172a' }}>
                                    <input type="checkbox" checked={form.required_course_ids.includes(c.id)} onChange={e => {
                                        const next = e.target.checked ? [...form.required_course_ids, c.id] : form.required_course_ids.filter(id => id !== c.id);
                                        setForm({ ...form, required_course_ids: next });
                                    }} /> {c.course_name} <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({c.target_track})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ flex: 1, padding: '0.85rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{editingId ? '修正内容を保存' : '企業情報を登録'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ company_name: '', capacity: 1, location: '', business_domain: '', internship_description: '', required_course_ids: [] }); }} style={{ padding: '0.85rem', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>キャンセル</button>}
                    </div>
                </form>

                <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>登録済み企業一覧</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {companies.map(cp => (
                            <div key={cp.id} style={{ border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', fontSize: '1.05rem' }}>{cp.company_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>定員: {cp.capacity}名 / エリア: {cp.location} / 領域: {cp.business_domain}</div>
                                </div>
                                <button onClick={() => startEdit(cp)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>修正</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}