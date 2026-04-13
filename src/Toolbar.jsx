export default function Toolbar({ onNew, texts, activeId, setTexts, currentUser, onLogout }) {
  
  function handleSave() {
    const text = texts.find(t => t.id === activeId)
    if (!text) return
    const name = prompt('שם הקובץ לשמירה:', text.title)
    if (!name) return

    // שמירה עם מזהה משתמש בשם המפתח
    const fileKey = `file_${currentUser}_${name}`
    localStorage.setItem(fileKey, JSON.stringify({ ...text, owner: currentUser }))
    alert(`הקובץ "${name}" נשמר עבור המשתמש ${currentUser}`)
  }

  function handleOpen() {
    // סינון מפתחות שמתחילים בקידומת של המשתמש הנוכחי בלבד
    const userPrefix = `file_${currentUser}_`
    const keys = Object.keys(localStorage).filter(k => k.startsWith(userPrefix))
    
    if (keys.length === 0) {
      alert('לא נמצאו קבצים עבור משתמש זה')
      return
    }

    const names = keys.map(k => k.replace(userPrefix, ''))
    const name = prompt('בחר קובץ לפתיחה:\n' + names.join('\n'))
    if (!name) return

    const raw = localStorage.getItem(userPrefix + name)
    if (raw) {
      const loaded = JSON.parse(raw)
      setTexts(prev => [...prev, loaded])
    }
  }

  return (
    <div className="toolbar">
      <span className="app-title">✏️ עורך טקסטים</span>
      <div className="toolbar-actions">
        <button onClick={onNew}>+ חדש</button>
        <button onClick={handleSave}>💾 שמור</button>
        <button onClick={handleOpen}>📂 פתח</button>
        <button onClick={onLogout} className="danger">יציאה</button>
      </div>
    </div>
  )
}