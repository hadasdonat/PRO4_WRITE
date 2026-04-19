import { useState, useEffect } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

/**
 * פונקציית עזר לייצור אובייקט מסמך ראשוני.
 * המסמך נוצר ללא כותרת (title ריק) כדי לאפשר למשתמש להגדיר שם ייחודי רק בעת השמירה הראשונה ל-LocalStorage.
 */
function createText(id) {
  return { id, title: '', content: [] }
}

export default function App() {
  /* --- ניהול מצב (State) ונתונים --- */

  // החזקת זהות המשתמש המחובר לצורך סנכרון וטעינת קבצים אישיים מהדפדפן
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('logged_user') || '')

  /**
   * שליפת מסמכים מה-Persistence Layer (LocalStorage).
   * הפונקציה מבצעת סינון (Filter) של כל המפתחות בדפדפן לפי תחילית (Prefix) הייחודית למשתמש המחובר.
   */
  const getAllUserFiles = () => {
    if (!currentUser) return [];
    const prefix = `file_${currentUser}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    
    if (keys.length > 0) {
      return keys.map(k => JSON.parse(localStorage.getItem(k)));
    }
    return [];
  };

  // מערך הנתונים הראשי המכיל את כל המסמכים הפתוחים כרגע בזיכרון האפליקציה
  const [texts, setTexts] = useState(getAllUserFiles());
  
  // ניהול המזהה (ID) של המסמך הנמצא כרגע במוקד העריכה
  const [activeId, setActiveId] = useState(texts.length > 0 ? texts[0].id : null);
  
  // ניהול רציפות מזהים ייחודיים למניעת כפילויות בעת יצירת מסמכים חדשים
  const [nextId, setNextId] = useState(() => {
    if (texts.length === 0) return 1;
    return Math.max(...texts.map(t => t.id)) + 1;
  });
  
  // מחסנית (Stack) לניהול היסטוריית מצבים לצורך מימוש פונקציונליות Undo עד 20 צעדים אחורה
  const [history, setHistory] = useState([]);

  /**
   * Side Effect לסנכרון מזהה ה-ID הבא בכל שינוי במערך המסמכים.
   * מבטיח תקינות לוגית של ה-Key-Property ברשימות.
   */
  useEffect(() => {
    if (texts.length > 0) {
      const maxId = Math.max(...texts.map(t => t.id));
      setNextId(maxId + 1);
    }
  }, [texts]);

  /* --- פונקציות ניהול משתמש וסשן --- */

  const handleLogin = () => {
    const name = prompt('הכנס שם משתמש:');
    if (name) {
      setCurrentUser(name);
      localStorage.setItem('logged_user', name);
      window.location.reload(); // איתחול האפליקציה לצורך טעינת קבצי המשתמש החדש
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('logged_user');
    setCurrentUser('');
    window.location.reload();
  }

  /* --- לוגיקת עריכה וניהול תוכן (Business Logic) --- */

  /**
   * שמירת "צילום מצב" (Snapshot) של המערכת לפני ביצוע שינויים.
   * משתמש בשיבוט עמוק (Deep Copy) כדי למנוע שינויים רפרנציאליים לא רצויים ב-State.
   */
  const saveToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(texts))].slice(-20))
  }

  const undo = () => {
    if (history.length === 0) return
    const prevState = history[history.length - 1]
    setTexts(prevState)
    setHistory(prev => prev.slice(0, -1))
  }

  /**
   * הוספת מסמך חדש למערכת.
   * מימוש עקרון ה-Immutability ע"י יצירת מערך חדש (Spread Operator) ללא מוטציה של המקור.
   */
  function addText() {
    saveToHistory()
    const newT = createText(nextId)
    setTexts(prev => [...prev, newT])
    setActiveId(nextId)
    setNextId(n => n + 1)
  }

  /**
   * הסרת מסמך מהתצוגה הפעילה וניהול אוטומטי של בחירת המסמך הפעיל הבא.
   */
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

  /**
   * הזרקת תו חדש למערך התוכן של המסמך הפעיל.
   * הפונקציה מעדכנת את ה-State בצורה פונקציונלית ע"י שימוש ב-map לייצור עותק מעודכן.
   */
  function addChar(char, style) {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: [...t.content, { char, style }]
      }
    ))
  }

  // מחיקת התו האחרון מהמסמך הנבחר
  function deleteChar() {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: t.content.slice(0, -1)
      }
    ))
  }

  // מחיקת המילה האחרונה ע"י חישוב אינדקס הרווח האחרון בתוכן
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

  // עדכון גורף של עיצוב (Style) לכל התווים הקיימים במסמך הפעיל
  function applyStyleToAll(style) {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: t.content.map(item => ({ ...item, style }))
      }
    ))
  }

  // איפוס תוכן המסמך הפעיל ללא מחיקת המסמך עצמו
  function clearText() {
    if (!activeId) return;
    saveToHistory()
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : { ...t, content: [] }
    ))
  }

  /* --- רינדור (Rendering) --- */

  // הגנה: רינדור מותנה (Conditional Rendering) למניעת גישה ללא הזדהות
  if (!currentUser) {
    return (
      <div className="login-screen">
        <h2>ברוכים הבאים לעורך הטקסטים</h2>
        <button className="action-btn" onClick={handleLogin}>התחברות / הרשמה</button>
      </div>
    )
  }

  return (
    <div className="app">
      {/* סרגל כלים עליון: מקבל פונקציות עדכון (Callbacks) כ-Props (Lifting State Up) */}
      <Toolbar 
        onNew={addText} 
        texts={texts} 
        activeId={activeId} 
        setTexts={setTexts} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onRemove={removeText} 
      />
      
      <div style={{padding: '5px', background: '#eee', fontSize: '12px', textAlign: 'center'}}>
        משתמש מחובר: <b>{currentUser}</b>
      </div>

      {/* אזור התצוגה המרכזי: מטפל בהצגת כרטיסיות הטקסט או במצב ריק (Empty State) */}
      {texts.length === 0 ? (
        <div className="empty-state">
          <h3>אין קבצים פתוחים כרגע</h3>
          <p>לחצי על כפתור <b>"פתח"</b> למעלה כדי לפתוח קובץ קיים </p>
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

      {/* פאנל עריכה תחתון: מרכז את כלי העיצוב והמקלדת הוויזואלית */}
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