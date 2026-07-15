import { useState, useEffect } from 'react';
import AdminCompanies from './AdminCompanies';
import AdminCourses from './AdminCourses';
import AdminStudents from './AdminStudents';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ==========================================
// 1. ログイン画面 (バックエンドDB連動版)
// ==========================================
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.role, data.student_id);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'ログインに失敗しました。');
      }
    } catch (e) {
      setError('サーバーと通信できません。バックエンドが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 700, fontSize: '1.5rem' }}>実習マッチングシステム</h2>
        {/* <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>理系研究室・インターン配属コントロール</p> */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>ユーザーID (学生: 学籍番号)</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="例: S2026101" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>パスワード</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '認証中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
// ==========================================
// 2. 学生専用マイページ画面
// ==========================================
function StudentMyPage({ studentId, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', student_number: '', course_ids: [], preference_company_ids: ['', '', ''] });
  const [masters, setMasters] = useState({ courses: [], companies: [] });

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/student-profile/${studentId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setErrorMessage('学生データが見つかりません。管理者画面から「システム一括初期化」を行ってください。');
        }
        return;
      }
      const data = await res.json();
      setErrorMessage('');
      setForm({
        name: data.profile.name, email: data.profile.email, student_number: data.profile.student_number,
        course_ids: data.current_courses || [],
        preference_company_ids: [data.current_preferences[0] || '', data.current_preferences[1] || '', data.current_preferences[2] || '']
      });
      setMasters(data.masters);
    } catch (e) {
      setErrorMessage('バックエンドサーバーとの通信に失敗しました。');
    }
  };

  useEffect(() => { loadData(); }, [studentId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name, email: form.email, course_ids: form.course_ids,
      preference_company_ids: form.preference_company_ids.filter(id => id !== '').map(id => parseInt(id))
    };
    try {
      const res = await fetch(`${API_URL}/student-profile/${studentId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) { alert('保存に失敗しました。'); } finally { setLoading(false); }
  };

  if (errorMessage) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{errorMessage}</p>
        <button onClick={onLogout} style={{ marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px' }}>戻る</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>学生ポータル・実習申請ページ</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>登録情報の確認と実習先の希望調査</p>
          </div>
          <button onClick={onLogout} style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>ログアウト</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>学生個人情報</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>学籍番号</label>
                  <input type="text" value={form.student_number} disabled style={{ width: '100%', padding: '0.6rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#64748b', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>氏名</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>大学連絡用メールアドレス</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>履修済み科目の登録</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>単位取得済み、または現在履修中の講義を選択してください。</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {masters.courses.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: form.course_ids.includes(c.id) ? '#f8fafc' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.course_ids.includes(c.id)} onChange={e => {
                      const next = e.target.checked ? [...form.course_ids, c.id] : form.course_ids.filter(id => id !== c.id);
                      setForm({ ...form, course_ids: next });
                    }} style={{ marginTop: '0.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{c.course_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{c.year}年次配当 / {c.course_type} / コース: {c.target_track}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>実習配属先の希望順位</h3>
              {[0, 1, 2].map(index => (
                <div key={index} style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>第 {index + 1} 希望</label>
                  <select value={form.preference_company_ids[index]} onChange={e => {
                    const next = [...form.preference_company_ids];
                    next[index] = e.target.value;
                    setForm({ ...form, preference_company_ids: next });
                  }} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', fontSize: '0.95rem' }}>
                    <option value="">-- 選択してください --</option>
                    {masters.companies.map(cp => <option key={cp.id} value={cp.id}>{cp.company_name}</option>)}
                  </select>
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? '保存中...' : '申請内容を確定する'}
              </button>
            </div>
          </div>
        </form>

        <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>受け入れ実習先企業の詳細情報</h3>
          {masters.companies.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>登録されている企業情報はありません。</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {masters.companies.map(cp => (
                <div key={cp.id} style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{cp.company_name}</strong>
                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>定員 {cp.capacity} 名</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.6' }}>
                    <span style={{ fontWeight: 600 }}>エリア:</span> {cp.location}<br />
                    <span style={{ fontWeight: 600 }}>ビジネス領域:</span> {cp.business_domain}
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>実習内容概要</div>
                    {cp.internship_description}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <span style={{ fontWeight: 600 }}>優遇される履修要件科目:</span><br />
                    {cp.required_course_ids.length === 0 ? '特になし' :
                      cp.required_course_ids.map(cid => {
                        const course = masters.courses.find(c => c.id === cid);
                        return course ? `・${course.course_name}` : '';
                      }).join(' ')
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. 総合ダッシュボード画面
// ==========================================
function AdminConsoleDashboard({ onBack, coursesMaster, companies }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/setup-mock-data/`, { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
      setMatches([]);
    } catch (e) { setMessage('初期化に失敗しました。'); } finally { setLoading(false); }
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/run-matching/`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setMatches(data.matches);
        setMessage('マッチング配置を計算しました。');
      }
    } catch (e) { setMessage('実行に失敗しました。'); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={onBack} style={{ marginBottom: '2rem', padding: '0.6rem 1.2rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>戻る</button>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>企業マッチングシミュレータ / 総合計算コンソール</h2>

      <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '2.5rem', alignItems: 'center' }}>
        <button onClick={handleSetup} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>システムデータ初期化</button>
        <button onClick={handleRun} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>マッチング計算を実行</button>
        {message && <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginLeft: '1rem' }}>{message}</span>}
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem' }}>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600 }}>配置学生</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600 }}>割り当て決定実習先</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600 }}>ビジネス領域</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 600 }}>適合スコア</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600 }}>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>シミュレーションは未実行です。</td></tr>
            ) : (
              matches.map((match, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{match.student_name}</td>
                  <td style={{ padding: '1rem', color: '#0f172a' }}>{match.company_name}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{match.company_domain}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{match.calculated_score.toFixed(1)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{match.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. メイン管理者メニュー
// ==========================================
function AdminPage({ onLogout }) {
  const [currentView, setCurrentView] = useState('main');
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const loadAdminData = async () => {
    try {
      const resComp = await fetch(`${API_URL}/companies`);
      if (resComp.ok) setCompanies(await resComp.json());
    } catch (e) { console.error(e); }

    try {
      const resCourses = await fetch(`${API_URL}/admin/courses`);
      if (resCourses.ok) setCourses(await resCourses.json());
    } catch (e) { console.error(e); }

    try {
      const resStudents = await fetch(`${API_URL}/admin/students`);
      if (resStudents.ok) setStudents(await resStudents.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAdminData(); }, []);

  const handleSystemReset = async () => {
    if (!window.confirm("全てのデータを初期化しますか？")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/setup-mock-data/`, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      loadAdminData();
      setMatchResults([]);
    } catch (e) { alert("初期化に失敗しました"); } finally { setLoading(false); }
  };

  const handleRunMatching = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/run-matching/`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setMatchResults(data.matches || []);
    } catch (e) { alert("マッチング計算に失敗しました"); } finally { setLoading(false); }
  };

  if (currentView === 'companies_view') return <AdminCompanies companies={companies} coursesMaster={courses} onBack={() => setCurrentView('main')} loadData={loadAdminData} />;
  if (currentView === 'courses_view') return <AdminCourses courses={courses} onBack={() => setCurrentView('main')} loadData={loadAdminData} />;
  if (currentView === 'students_view') return <AdminStudents students={students} onBack={() => setCurrentView('main')} loadData={loadAdminData} />;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '3rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>管理者画面</h2>
          </div>
          <button onClick={onLogout} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>ログアウト</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <button onClick={() => setCurrentView('companies_view')} style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>実習先企業情報</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>企業情報、定員、および要求履修科目の管理</p>
          </button>

          <button onClick={() => setCurrentView('courses_view')} style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>講義データ</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>配当年次、授業形態、専門コース属性の管理</p>
          </button>

          <button onClick={() => setCurrentView('students_view')} style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>所属学生データ</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>学籍番号、氏名、メールアドレスの管理</p>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button onClick={handleSystemReset} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>システム一括初期化</button>
          <button onClick={handleRunMatching} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>マッチング配置を計算</button>
        </div>

        {matchResults.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>配属先決定結果一覧</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>学生名</th>
                  <th style={{ padding: '1rem 0.5rem' }}>決定実習先企業</th>
                  <th style={{ padding: '1rem 0.5rem' }}>領域属性</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>総スコア</th>
                </tr>
              </thead>
              <tbody>
                {matchResults.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.95rem' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{r.student_name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: '#0f172a' }}>{r.company_name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: '#475569' }}>{r.company_domain}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{r.calculated_score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. メインエントリー
// ==========================================
function App() {
  const [userRole, setUserRole] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);

  const handleLoginSuccess = (role, studentId) => {
    setUserRole(role);
    setActiveStudentId(studentId);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveStudentId(null);
  };

  if (!userRole) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  if (userRole === 'admin') return <AdminPage onLogout={handleLogout} />;
  if (userRole === 'student') return <StudentMyPage studentId={activeStudentId} onLogout={handleLogout} />;
  return null;
}

export default App;