import { useState, useEffect } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

function createText(id) {
  return { 
    id, title: '', content: [], 
    lastStyle: { fontFamily: 'Arial', fontSize: '16px', color: '#000000', fontWeight: 'normal' } 
  }
}

/* --- LoginScreen המעוצב --- */
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{color: '#4a90e2'}}>TextEditor Pro</h1>
        <p>נא להזין פרטים כדי להתחיל לעבוד</p>
        <div className="input-group">
          <label>שם משתמש</label>
          <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="שם משתמש..." />
        </div>
        <div className="input-group">
          <label>סיסמה</label>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="סיסמה..." />
        </div>
        <button className="login-btn" onClick={() => onLogin(user, pwd)}>התחברות</button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('logged_user') || '');
  const [texts, setTexts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentStyle, setCurrentStyle] = useState({ fontFamily: 'Arial', fontSize: '16px', color: '#000000' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const prefix = `file_${currentUser}_`;
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      const files = keys.map(k => JSON.parse(localStorage.getItem(k)));
      setTexts(files);
      if (files.length > 0) setActiveId(files[0].id);
    }
  }, [currentUser]);

  useEffect(() => {
    const activeText = (texts || []).find(t => t.id === activeId);
    if (activeText?.lastStyle) setCurrentStyle(activeText.lastStyle);
    setMatchIndex(-1);
  }, [activeId]);

  /* --- לוגיקת החיפוש (Find Next) --- */
  function findNext() {
    if (!activeId || !searchQuery) return;
    const activeText = texts.find(t => t.id === activeId);
    if (!activeText || !activeText.content) return;

    const content = activeText.content;
    let found = -1;

    // חיפוש מהמיקום הבא והלאה
    for (let i = matchIndex + 1; i < content.length; i++) {
      if (content[i].char === searchQuery) { found = i; break; }
    }

    // חיפוש מעגלי מההתחלה
    if (found === -1) {
      for (let i = 0; i <= matchIndex; i++) {
        if (content[i].char === searchQuery) { found = i; break; }
      }
    }

    if (found !== -1) setMatchIndex(found);
    else alert("התו לא נמצא!");
  }

  /* --- החלפה בודדת (Fixed) --- */
  function replaceCurrent() {
    // בדיקה שיש לנו אינדקס תקין מהחיפוש
    if (matchIndex === -1 || !activeId) return;

    saveToHistory();
    const targetIndex = matchIndex; // קיבוע האינדקס הנוכחי

    setTexts(prevTexts => prevTexts.map(t => {
      if (t.id !== activeId) return t;

      // שימוש ב-map כדי להבטיח עדכון עמוק ותקין של המערך
      const updatedContent = t.content.map((item, idx) => 
        idx === targetIndex ? { ...item, char: replaceQuery } : item
      );

      return { ...t, content: updatedContent };
    }));

    // איפוס הסימון הצהוב אחרי ההחלפה (כי התו השתנה)
    setMatchIndex(-1);
  }

  /* --- החלפה של הכל (כמו שעובד לך) --- */
  function replaceAll() {
    if (!activeId || !searchQuery) return;
    saveToHistory();

    setTexts(prevTexts => prevTexts.map(t => {
      if (t.id !== activeId) return t;
      const newContent = t.content.map(item => 
        item.char === searchQuery ? { ...item, char: replaceQuery } : item
      );
      return { ...t, content: newContent };
    }));
  }

  /* --- ניהול עריכה וקבצים --- */
  function updateStyle(newStyle) {
    const updated = typeof newStyle === 'function' ? newStyle(currentStyle) : newStyle;
    setCurrentStyle(updated);
    setTexts(prev => prev.map(t => t.id === activeId ? { ...t, lastStyle: updated } : t));
  }

  const saveToHistory = () => setHistory(prev => [...prev, JSON.parse(JSON.stringify(texts))].slice(-20));
  const handleLogin = (u, p) => { if(u && p) { localStorage.setItem('logged_user', u); setCurrentUser(u); } };
  const handleLogout = () => { localStorage.removeItem('logged_user'); setCurrentUser(''); setTexts([]); setActiveId(null); };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      <Toolbar 
        onNew={() => { const n = createText(nextId); setTexts([...texts, n]); setActiveId(nextId); setNextId(nextId+1); }} 
        texts={texts} activeId={activeId} setTexts={setTexts} currentUser={currentUser} 
        onLogout={handleLogout} onRemove={(id) => setTexts(texts.filter(t => t.id !== id))} 
      />

      <div className="status-bar" style={{padding: '5px 15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '14px'}}>
        משתמשת: <b>{currentUser}</b> | <span onClick={handleLogout} style={{color: 'red', cursor: 'pointer', textDecoration: 'underline'}}>התנתקות</span>
      </div>

      {showSearch && (
        <div className="search-bar-inline" style={{padding: '10px', background: '#e9ecef', display: 'flex', gap: '8px', justifyContent: 'center'}}>
          <input maxLength="1" placeholder="תו לחיפוש" value={searchQuery} onChange={e => {setSearchQuery(e.target.value); setMatchIndex(-1)}} />
          <input maxLength="1" placeholder="תו להחלפה" value={replaceQuery} onChange={e => setReplaceQuery(e.target.value)} />
          <button onClick={findNext}>מצא הבא 🔍</button>
          <button onClick={replaceCurrent}>החלף בודד ✅</button>
          <button onClick={replaceAll} style={{background: '#4CAF50', color: 'white'}}>החלף הכל ✨</button>
          <button onClick={() => {setShowSearch(false); setMatchIndex(-1)}}>סגור</button>
        </div>
      )}

      {texts.length === 0 ? <div style={{textAlign: 'center', padding: '50px'}}><h3>אין קבצים פתוחים</h3></div> : (
        <TextDisplayArea texts={texts} activeId={activeId} onSelect={setActiveId} onClose={(id) => setTexts(texts.filter(t=>t.id!==id))} highlightIndex={matchIndex} />
      )}

      <EditorPanel style={currentStyle} onChange={updateStyle} onAddChar={(char, style) => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: [...t.content, {char, style}]} : t)); }} onDelete={() => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: t.content.slice(0, -1)} : t)); }} onClear={() => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: []} : t)); }} onApplyToAll={(s) => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: t.content.map(c => ({...c, style: s}))} : t)); }} onUndo={() => { if(history.length > 0) { setTexts(history[history.length-1]); setHistory(prev => prev.slice(0,-1)); } }} onFindReplace={() => setShowSearch(true)} />
    </div>
  );
}