export default function Toolbar({ onNew, texts, activeId, setTexts, currentUser, onLogout, onRemove }) {
  
  /**
   * פונקציית שמירה וסגירה (Save & Close).
   * לוקחת את הקובץ הפעיל מה-Workspace (הקבצים הפתוחים), נותנת לו שם (אם אין לו),
   * שומרת אותו ב"ארכיון" הקבוע ב-LocalStorage, וסוגרת אותו מהתצוגה הפעילה.
   */
  function handleSave() {
    // שליפת הקובץ הפעיל. שימוש ב-Early Return עוצר את הפונקציה אם אין קובץ פתוח
    const text = texts.find(t => t.id === activeId)
    if (!text) return

    // לוגיקת מתן שם לקובץ: אם אין כותרת, מבקשים מהמשתמש דרך Prompt
    let fileName = text.title;
    if (!fileName) {
      fileName = prompt('הכנס שם לשמירת הקובץ:');
      // הגנה: אם המשתמש לחץ "ביטול" או לא הזין שם, עוצרים את תהליך השמירה
      if (!fileName) return;
    }

    // יצירת מפתח ייחודי לקובץ בארכיון, מבוסס על שם המשתמש ושם הקובץ (מונע זליגת מידע בין משתמשים)
    const fileKey = `file_${currentUser}_${fileName}`
    
    // שמירה פרסיסטנטית (Persistent Storage) תוך דריסת הכותרת והוספת בעלות
    localStorage.setItem(fileKey, JSON.stringify({ ...text, title: fileName, owner: currentUser }))
    
    alert(`הקובץ "${fileName}" נשמר בהצלחה!`)
    
    // הסרת הקובץ ממערך הכרטיסיות הפתוחות לאחר השמירה (סגירה אוטומטית)
    onRemove(activeId); 
  }

  /**
   * פונקציית פתיחת קובץ קיים מהארכיון אל סביבת העבודה.
   * סורקת את ה-LocalStorage, מציגה למשתמש את הקבצים שלו, וטוענת את הקובץ הנבחר.
   */
  function handleOpen() {
    const userPrefix = `file_${currentUser}_`
    
    // שליפת כל המפתחות מה-LocalStorage וסינון רק של אלו ששייכים למשתמש הנוכחי
    const keys = Object.keys(localStorage).filter(k => k.startsWith(userPrefix))
    
    if (keys.length === 0) {
      alert('לא נמצאו קבצים שמורים עבורך.')
      return
    }

    // חילוץ שמות הקבצים הנקיים מתוך המפתחות לצורך תצוגה למשתמש
    const names = keys.map(k => k.replace(userPrefix, ''))
    const fileName = prompt('בחר קובץ לפתיחה:\n' + names.join('\n'))
    if (!fileName) return

    // הגנה מפני כפילויות (Data Duplication): בדיקה אם הקובץ כבר פתוח כרגע ב-Workspace
    const isAlreadyOpen = texts.find(t => t.title === fileName);
    if (isAlreadyOpen) {
      alert('הקובץ כבר פתוח בתצוגה.');
      return;
    }

    // משיכת הקובץ מהזיכרון והזרקתו (Push) למערך ה-State של הקבצים הפתוחים ב-App
    const raw = localStorage.getItem(userPrefix + fileName)
    if (raw) {
      const loaded = JSON.parse(raw)
      setTexts(prev => [...prev, loaded])
    }
  }

  return (
    <div className="toolbar">
      {/* פונקציית הוספת קובץ חדש (onNew) מנוהלת ב-App עצמו כדי לשמור על ID רציף */}
      <button className="tool-btn" onClick={onNew}>+ חדש</button>
      <button className="tool-btn" onClick={handleSave}>שמור</button>
      <button className="tool-btn" onClick={handleOpen}>פתח</button>
      
      {/* כפתור היציאה נדחף לשמאל אוטומטית בעזרת flexbox (margin-right: auto) המוגדר ב-CSS */}
      <button className="tool-btn logout-btn" onClick={onLogout}>יציאה</button>
    </div>
  )
}