import { useState, useEffect } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

function createText(id) {
  return { id, title: `טקסט ${id}`, content: [] }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('logged_user') || '')

  // פונקציה שטוענת את כל הקבצים השמורים של המשתמש מה-LocalStorage
  const getAllUserFiles = () => {
    if (!currentUser) return [];
    // מחפשים את כל המפתחות שמתחילים בקידומת של המשתמש הנוכחי
    const prefix = `file_${currentUser}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    
    if (keys.length > 0) {
      // טוענים את התוכן של כל הקבצים שמצאנו
      return keys.map(k => JSON.parse(localStorage.getItem(k)));
    }
    // אם אין שום קובץ שמור, מחזירים מערך ריק
    return [];
  };

  const [texts, setTexts] = useState(getAllUserFiles());
  const [activeId, setActiveId] = useState(texts.length > 0 ? texts[0].id : null);
  const [nextId, setNextId] = useState(() => {
    if (texts.length === 0) return 1;
    return Math.max(...texts.map(t => t.id)) + 1;
  });
  const [history, setHistory] = useState([]);

  // עדכון ה-ID הבא בכל פעם שהרשימה משתנה כדי למנוע כפילויות בעתיד
  useEffect(() => {
    if (texts.length > 0) {
      const maxId = Math.max(...texts.map(t => t.id));
      setNextId(maxId + 1);
    }
  }, [texts]);

  function handleLogin() {
    const name = prompt('הכנס שם משתמש:');
    if (name) {
      setCurrentUser(name);
      localStorage.setItem('logged_user', name);
      // טעינה מחדש כדי לאתחל את ה-State עם הקבצים של המשתמש החדש
      window.location.reload(); 
    }
  }

  function handleLogout() {
    localStorage.removeItem('logged_user');
    setCurrentUser('');
    window.location.reload();
  }

  const saveToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(texts))].slice(-20))
  }

  function undo() {
    if (history.length === 0) return
    const prevState = history[history.length - 1]
    setTexts(prevState)
    setHistory(prev => prev.slice(0, -1))
  }

  function addText() {
    saveToHistory()
    const newT = createText(nextId)
    setTexts(prev => [...prev, newT])
    setActiveId(nextId)
    setNextId(n => n + 1)
  }

  function removeText(id) {
    saveToHistory()
    const remaining = texts.filter(t => t.id !== id)
    setTexts(remaining)
    if (activeId === id && remaining.length > 0) {
      setActiveId(remaining[0].id)
    } else if (remaining.length === 0) {
      setActiveId(null)
    }
  }

  function addChar(char, style) {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: [...t.content, { char, style }]
      }
    ))
  }

  function deleteChar() {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: t.content.slice(0, -1)
      }
    ))
  }

  function deleteWord() {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t => {
      if (t.id !== activeId) return t
      const lastSpace = [...t.content].reverse().findIndex(item => item.char === ' ')
      const cutIndex = lastSpace === -1 ? 0 : t.content.length - 1 - lastSpace
      return { ...t, content: t.content.slice(0, cutIndex) }
    }))
  }

  function applyStyleToAll(style) {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: t.content.map(item => ({ ...item, style }))
      }
    ))
  }

  function clearText() {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : { ...t, content: [] }
    ))
  }

  // מסך התחברות
  if (!currentUser) {
    return (
      <div className="login-screen" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>ברוכים הבאים לעורך הטקסטים</h2>
        <button className="action-btn" onClick={handleLogin}>התחברות / הרשמה</button>
      </div>
    )
  }

  return (
    <div className="app">
      <Toolbar 
        onNew={addText} 
        texts={texts} 
        activeId={activeId} 
        setTexts={setTexts} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />
      
      <div style={{padding: '5px', background: '#eee', fontSize: '12px', textAlign: 'center'}}>
        משתמש מחובר: <b>{currentUser}</b>
      </div>

      {/* אם אין טקסטים פתוחים, מציגים הודעה מכוונת */}
      {texts.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
          <h3>אין קבצים פתוחים כרגע</h3>
          <p>לחצי על כפתור <b>"+ חדש"</b> למעלה כדי להתחיל לעבוד</p>
        </div>
      ) : (
        <TextDisplayArea 
          texts={texts} 
          activeId={activeId} 
          onSelect={setActiveId} 
          onClose={removeText} 
        />
      )}

      <EditorPanel 
        onAddChar={addChar} 
        onDelete={deleteChar} 
        onDeleteWord={deleteWord}
        onClear={clearText} 
        onApplyToAll={applyStyleToAll}
        onUndo={undo}
      />
    </div>
  )
}