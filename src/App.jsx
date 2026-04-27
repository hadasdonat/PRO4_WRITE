import { useState, useEffect } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

/**
 * פונקציית עזר ליצירת מבנה נתונים התחלתי לקובץ חדש.
 * מבטיחה שכל קובץ ייווצר עם אותו חוזה נתונים (ID, תוכן ריק, ועיצוב ברירת מחדל).
 */
function createText(id) {
  return { 
    id, 
    title: '', 
    content: [], 
    lastStyle: { fontFamily: 'Arial', fontSize: '16px', color: '#000000', fontWeight: 'normal' } 
  }
}

/* --- מסך כניסה (לוגיקה פשוטה לניהול משתמשים מול LocalStorage) --- */
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
  // --- ניהול המצב הגלובלי (Global State) של האפליקציה ---
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('logged_user') || '');
  const [texts, setTexts] = useState([]); // מערך כל הקבצים
  const [activeId, setActiveId] = useState(null); // מזהה הקובץ הפתוח כרגע
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState([]); // מחסנית לביצוע Undo
  const [currentStyle, setCurrentStyle] = useState({ fontFamily: 'Arial', fontSize: '16px', color: '#000000' });
  
  // ניהול מיקום הסמן המהבהב (אינדקס בתוך מערך התווים של הקובץ הפעיל)
  const [cursorIndex, setCursorIndex] = useState(0);

  // מצבי חיפוש והחלפה
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);

  // 1. טעינת נתונים ראשונית מה-LocalStorage מיד כשמשתמש מתחבר
  useEffect(() => {
    if (currentUser) {
      const storedData = localStorage.getItem(`app_data_${currentUser}`);
      if (storedData) {
        const parsedFiles = JSON.parse(storedData);
        setTexts(parsedFiles);
        if (parsedFiles.length > 0) {
          setActiveId(parsedFiles[0].id);
          // חישוב ה-ID הבא כדי למנוע דריסת קבצים קיימים
          setNextId(Math.max(...parsedFiles.map(f => f.id), 0) + 1);
        }
      }
    }
  }, [currentUser]);

  // 2. שמירה אוטומטית (Auto-Save): כל שינוי במערך texts נשמר ישירות לדיסק
  useEffect(() => {
    if (currentUser && texts.length >= 0) {
      localStorage.setItem(`app_data_${currentUser}`, JSON.stringify(texts));
    }
  }, [texts, currentUser]);

  // 3. סנכרון מעבר בין קבצים: כשבוחרים קובץ אחר, משחזרים את העיצוב האחרון שלו ומקפיצים את הסמן לסוף
  useEffect(() => {
    const activeFile = texts.find(t => t.id === activeId);
    if (activeFile) {
      if (activeFile.lastStyle) setCurrentStyle(activeFile.lastStyle);
      setCursorIndex(activeFile.content.length);
    }
    setMatchIndex(-1); // איפוס תוצאות חיפוש
  }, [activeId]); 

  // עדכון סטייל: מעדכן גם את הסטייט המקומי של המקלדת וגם שומר את העיצוב לקובץ עצמו
  function updateStyle(newStyleAction) {
    const updated = typeof newStyleAction === 'function' ? newStyleAction(currentStyle) : newStyleAction;
    setCurrentStyle(updated); 
    setTexts(prev => prev.map(t => t.id === activeId ? { ...t, lastStyle: updated } : t));
  }

  /* --- לוגיקת חיפוש והחלפה --- */
  function findNext() {
    if (!activeId || !searchQuery) return -1;
    const activeText = texts.find(t => t.id === activeId);
    if (!activeText) return -1;
    const content = activeText.content;
    let found = -1;
    
    // חיפוש קדימה ממיקום הסמן הנוכחי
    for (let i = matchIndex + 1; i < content.length; i++) {
      if (content[i].char === searchQuery) { found = i; break; }
    }
    // אם לא מצאנו קדימה, חיפוש מעגלי מתחילת הקובץ
    if (found === -1) {
      for (let i = 0; i <= matchIndex; i++) {
        if (content[i].char === searchQuery) { found = i; break; }
      }
    }
    
    if (found !== -1) { 
      setMatchIndex(found); 
      setCursorIndex(found + 1); // מקפיץ את הסמן מיד אחרי האות שנמצאה
      return found; 
    } else { 
      alert("לא נמצא"); 
      setMatchIndex(-1); 
      return -1; 
    }
  }

  // החלפת התו הנוכחי שנמצא בחיפוש
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
    setTimeout(findNext, 50); // ממשיך אוטומטית לתוצאה הבאה
  }

  // החלפת כל המופעים של התו בקובץ (O(N) בסיבוב אחד)
  function replaceAll() {
    if (!activeId || !searchQuery) return;
    saveToHistory();
    setTexts(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      return { ...t, content: t.content.map(item => item.char === searchQuery ? { ...item, char: replaceQuery } : item) };
    }));
  }

  // ניהול היסטוריה ל-Undo: שומר עותק עמוק (Deep Copy) ומגביל ל-20 צעדים אחרונים כדי למנוע דליפת זיכרון
  const saveToHistory = () => setHistory(prev => [...prev, JSON.parse(JSON.stringify(texts))].slice(-20));

  const handleLogin = (u, p) => {
    if (!u || !p) return alert("מלאי פרטים");
    localStorage.setItem(`pwd_${u}`, p);
    localStorage.setItem('logged_user', u);
    setCurrentUser(u);
  };

  // מנגנון חסימת גישה: אם אין משתמש מחובר, נרנדר רק את מסך ההתחברות
  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      <Toolbar 
        onNew={() => { 
          const n = createText(nextId); 
          setTexts(prev => [...prev, n]); 
          setActiveId(nextId); 
          setNextId(prev => prev + 1); 
          setCursorIndex(0); // קובץ חדש מתחיל עם סמן ב-0
        }} 
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

      {/* העברת נתוני התצוגה והסמן אל אזור הכרטיסיות */}
      <TextDisplayArea 
        texts={texts} 
        activeId={activeId} 
        onSelect={setActiveId} 
        onClose={(id) => setTexts(prev => prev.filter(t=>t.id!==id))} 
        highlightIndex={matchIndex} 
        cursorIndex={cursorIndex}
        onSetCursor={setCursorIndex}
      />

      <EditorPanel 
        style={currentStyle} 
        onChange={updateStyle} 
        
        // --- הוספת תו ---
        onAddChar={(char, style) => { 
          saveToHistory(); 
          setTexts(prev => prev.map(t => {
            if (t.id !== activeId) return t;
            // שימוש ב-slice כדי "לפתוח" את המערך במיקום הסמן, להזריק את התו, ולסגור חזרה. שומר על Immutability.
            const newContent = [
              ...t.content.slice(0, cursorIndex),
              {char, style},
              ...t.content.slice(cursorIndex)
            ];
            return {...t, content: newContent};
          })); 
          setCursorIndex(prev => prev + 1); // קידום הסמן צעד אחד קדימה
        }} 
        
        // --- מחיקת תו אחרון (Backspace) ---
        onDelete={() => { 
          if (cursorIndex === 0) return; // אי אפשר למחוק אם אנחנו בתחילת הקובץ
          saveToHistory(); 
          setTexts(prev => prev.map(t => {
            if (t.id !== activeId) return t;
            // "חותכים" החוצה בדיוק את התו שנמצא אחד לפני הסמן
            const newContent = [
              ...t.content.slice(0, cursorIndex - 1),
              ...t.content.slice(cursorIndex)
            ];
            return {...t, content: newContent};
          })); 
          setCursorIndex(prev => Math.max(0, prev - 1));
        }} 
        
        // --- מחיקת מילה שלמה ---
        onDeleteWord={() => {
          if (cursorIndex === 0) return;
          saveToHistory();
          setTexts(prev => prev.map(t => {
            if (t.id !== activeId) return t;
            const content = t.content;
            let i = cursorIndex - 1;
            
            // אלגוריתם חיתוך: הולכים אחורה עד שמדלגים על רווחים עודפים, ואז עד שמגיעים לרווח הבא
            while (i >= 0 && content[i].char === ' ') i--;
            while (i >= 0 && content[i].char !== ' ') i--;
            
            // בונים את המערך מחדש ללא המילה שנמצאה
            const newContent = [
              ...content.slice(0, i + 1),
              ...content.slice(cursorIndex)
            ];
            setCursorIndex(i + 1);
            return { ...t, content: newContent };
          }));
        }}
        
        onClear={() => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: []} : t)); setCursorIndex(0); }} 
        onApplyToAll={(s) => { saveToHistory(); setTexts(prev => prev.map(t => t.id === activeId ? {...t, content: t.content.map(c => ({...c, style: s}))} : t)); }} 
        
        // --- שחזור צעד אחרון (Undo) ---
        onUndo={() => { 
          if(history.length > 0) { 
            const lastState = history[history.length-1];
            setTexts(lastState); 
            setHistory(prev => prev.slice(0,-1)); // מסירים את המצב ששחזרנו מהמחסנית
            
            // מוודאים שהסמן לא נשאר ב"אוויר" אלא חוזר לסוף הקובץ אחרי השחזור
            const activeInLast = lastState.find(t => t.id === activeId);
            if (activeInLast) setCursorIndex(activeInLast.content.length);
          } 
        }} 
        onFindReplace={() => setShowSearch(true)} 
      />
    </div>
  );
}