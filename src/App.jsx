import { useState, useEffect } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

/**
 * פונקציית עזר ליצירת מבנה נתונים אחיד לקובץ חדש.
 * הכותרת מוגדרת כריקה בכוונה כדי שהרכיבים יזהו שזה קובץ חדש ויבקשו מהמשתמש להזין שם.
 */
function createText(id) {
  return { 
    id, 
    title: '', 
    content: [], 
    lastStyle: { fontFamily: 'Arial', fontSize: '16px', color: '#000000', fontWeight: 'normal' } 
  }
}

/* --- מסך כניסה (קומפוננטה מופרדת לניהול הלוגיקה לפני טעינת האפליקציה) --- */
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  
  return (
    <div className="login-container" style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5'}}>
      <div className="login-card" style={{background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '340px', textAlign: 'center'}}>
        <h1 style={{color: '#1a73e8', marginBottom: '1.5rem'}}>TextEditor Pro</h1>
        <div className="input-group" style={{marginBottom: '1rem', textAlign: 'right'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>שם משתמש</label>
          <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="הזיני שם משתמש..." style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}} />
        </div>
        <div className="input-group" style={{marginBottom: '1rem', textAlign: 'right'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>סיסמה</label>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="הזיני סיסמה..." style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}} />
        </div>
        <button className="login-btn" onClick={() => onLogin(user, pwd)} style={{width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '10px'}}>
          התחברות / רישום
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // ניהול המצבים (State Management) של האפליקציה בשיטת Lifting State Up
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('logged_user') || '');
  const [texts, setTexts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState([]);
  
  // ניהול מצב העיצוב הנוכחי של המקלדת
  const [currentStyle, setCurrentStyle] = useState({ fontFamily: 'Arial', fontSize: '16px', color: '#000000' });
  
  // מצבי חיפוש והחלפה
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);

  // 1. טעינת נתונים - שימוש ב-Fallback למניעת אובדן מידע ישן
  useEffect(() => {
    if (currentUser) {
      const storedData = localStorage.getItem(`app_data_${currentUser}`);
      
      if (storedData) {
        // טעינה מהמבנה החדש (מקור אמת יחיד)
        const parsedFiles = JSON.parse(storedData);
        setTexts(parsedFiles);
        if (parsedFiles.length > 0) {
          setActiveId(parsedFiles[0].id);
          // חישוב ה-ID הבא כדי למנוע דריסת קבצים קיימים
          setNextId(Math.max(...parsedFiles.map(f => f.id), 0) + 1);
        }
      } else {
        // Fallback: מנסה לטעון מהמבנה הישן במקרה של מעבר גרסאות
        const prefix = `file_${currentUser}_`;
        const oldKeys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        if (oldKeys.length > 0) {
          const oldFiles = oldKeys.map(k => JSON.parse(localStorage.getItem(k))).sort((a, b) => a.id - b.id);
          setTexts(oldFiles);
          setActiveId(oldFiles[0].id);
          setNextId(Math.max(...oldFiles.map(f => f.id), 0) + 1);
        } else {
          // משתמש חדש לחלוטין
          setTexts([]);
          setActiveId(null);
          setNextId(1);
        }
      }
    }
  }, [currentUser]);

  // 2. שמירה אוטומטית (Auto-Save) למקור אמת יחיד ב-LocalStorage
  useEffect(() => {
    if (currentUser && texts.length >= 0) {
      localStorage.setItem(`app_data_${currentUser}`, JSON.stringify(texts));
    }
  }, [texts, currentUser]);

  // 3. סנכרון מצב המקלדת בעת מעבר בין קבצים
  useEffect(() => {
    const activeFile = texts.find(t => t.id === activeId);
    if (activeFile?.lastStyle) {
      setCurrentStyle(activeFile.lastStyle); // טעינת העיצוב השמור
    }
    setMatchIndex(-1); // איפוס סמן החיפוש במעבר קובץ
  }, [activeId, texts]); 

  // פונקציית עדכון עיצוב כפולה: מעדכנת את ה-UI מידית ודוחפת את השינוי לזיכרון של הקובץ
  function updateStyle(newStyleAction) {
    const updated = typeof newStyleAction === 'function' ? newStyleAction(currentStyle) : newStyleAction;
    setCurrentStyle(updated); 
    setTexts(prev => prev.map(t => t.id === activeId ? { ...t, lastStyle: updated } : t));
  }

  /* --- לוגיקת חיפוש והחלפה בעלת סיבוכיות O(N) וסריקה מעגלית --- */
  function findNext() {
    if (!activeId || !searchQuery) return -1;
    const activeText = texts.find(t => t.id === activeId);
    if (!activeText) return -1;
    const content = activeText.content;
    let found = -1;
    
    // סריקה מהמיקום הנוכחי והלאה
    for (let i = matchIndex + 1; i < content.length; i++) {
      if (content[i].char === searchQuery) { found = i; break; }
    }
    // סריקה מעגלית מתחילת הקובץ אם לא נמצא בהמשך
    if (found === -1) {
      for (let i = 0; i <= matchIndex; i++) {
        if (content[i].char === searchQuery) { found = i; break; }
      }
    }
    
    if (found !== -1) { setMatchIndex(found); return found; }
    else { alert("לא נמצא"); setMatchIndex(-1); return -1; }
  }

  function replaceCurrent() {
    if (!activeId || !searchQuery) return;
    let targetIdx = matchIndex === -1 ? findNext() : matchIndex;
    if (targetIdx === -1) return;
    saveToHistory();
    setTexts(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      const newContent = [...t.content];
      newContent[targetIdx] = { ...newContent[targetIdx], char: replaceQuery };
      return { ...t, content: newContent };
    }));
    setTimeout(findNext, 50); // השהייה קלה כדי לאפשר ל-State להתעדכן לפני החיפוש הבא
  }

  function replaceAll() {
    if (!activeId || !searchQuery) return;
    saveToHistory();
    // שימוש ב-map פנימי כדי להחליף את כל המופעים בלולאה אחת
    setTexts(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      return { ...t, content: t.content.map(item => item.char === searchQuery ? { ...item, char: replaceQuery } : item) };
    }));
  }

  // שמירת עותק עמוק (Deep Copy) של המערך למחסנית ההיסטוריה, מוגבל ל-20 צעדים למניעת עומס זיכרון
  const saveToHistory = () => setHistory(prev => [...prev, JSON.parse(JSON.stringify(texts))].slice(-20));

  // לוגיקת רישום והתחברות משולבת (אימות מול ה-LocalStorage)
  const handleLogin = (u, p) => {
    if (!u || !p) return alert("מלאי פרטים");
    const stored = localStorage.getItem(`pwd_${u}`);
    if (stored === null || stored === p) {
      localStorage.setItem(`pwd_${u}`, p);
      localStorage.setItem('logged_user', u);
      setCurrentUser(u);
    } else { alert("סיסמה שגויה"); }
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      <Toolbar 
        onNew={() => { const n = createText(nextId); setTexts(prev => [...prev, n]); setActiveId(nextId); setNextId(prev => prev + 1); }} 
        texts={texts} activeId={activeId} setTexts={setTexts} currentUser={currentUser} 
        onLogout={() => { localStorage.removeItem('logged_user'); window.location.reload(); }} 
        onRemove={(id) => setTexts(prev => prev.filter(t => t.id !== id))} 
      />

      <div className="status-bar" style={{padding: '5px 15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '13px'}}>
        מחוברת כ: <b>{currentUser}</b> | <span onClick={() => {localStorage.removeItem('logged_user'); window.location.reload();}} style={{color: 'red', cursor: 'pointer', fontWeight: 'bold'}}>התנתקות</span>
      </div>

      {showSearch && (
        <div className="search-bar-inline" style={{padding: '10px', background: '#e9ecef', display: 'flex', gap: '8px', justifyContent: 'center'}}>
          <input maxLength="1" placeholder="חפשי תו..." value={searchQuery} onChange={e => {setSearchQuery(e.target.value); setMatchIndex(-1)}} style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}}/>
          <input maxLength="1" placeholder="החליפי ב..." value={replaceQuery} onChange={e => setReplaceQuery(e.target.value)} style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}}/>
          <button onClick={findNext} style={{padding: '5px 10px', cursor: 'pointer'}}>חפש 🔍</button>
          <button onClick={replaceCurrent} style={{padding: '5px 10px', cursor: 'pointer'}}>החלף ✅</button>
          <button onClick={replaceAll} style={{background: '#4CAF50', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>החלף הכל ✨</button>
          <button onClick={() => {setShowSearch(false); setMatchIndex(-1)}} style={{padding: '5px 10px', cursor: 'pointer'}}>סגור</button>
        </div>
      )}

      <TextDisplayArea texts={texts} activeId={activeId} onSelect={setActiveId} onClose={(id) => setTexts(prev => prev.filter(t=>t.id!==id))} highlightIndex={matchIndex} />

      <EditorPanel 
        style={currentStyle} 
        onChange={updateStyle} 
        onAddChar={(char, style) => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: [...t.content, {char, style}]} : t)); }} 
        
        // מחיקת תו אחרון (חיתוך אלמנט בודד מהמערך)
        onDelete={() => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: t.content.slice(0, -1)} : t)); }} 
        
        // מחיקת מילה: עבודה עם אינדקסים וחיתוך (slice) במקום מניפולציות המפעילות רינדור כפול
        onDeleteWord={() => {
          saveToHistory();
          setTexts(prev => prev.map(t => {
            if (t.id !== activeId) return t;
            const content = t.content;
            if (content.length === 0) return t;
            
            let i = content.length - 1;
            while (i >= 0 && content[i].char === ' ') i--; // דילוג על רווחים עודפים בסוף
            while (i >= 0 && content[i].char !== ' ') i--; // חזרה אחורה עד תחילת המילה
            
            return { ...t, content: content.slice(0, i + 1) }; // יצירת מערך חדש ונקי
          }));
        }}
        
        onClear={() => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: []} : t)); }} 
        onApplyToAll={(s) => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: t.content.map(c => ({...c, style: s}))} : t)); }} 
        onUndo={() => { if(history.length > 0) { setTexts(history[history.length-1]); setHistory(prev => prev.slice(0,-1)); } }} 
        onFindReplace={() => setShowSearch(true)} 
      />
    </div>
  );
}