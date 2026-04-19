export default function Toolbar({ onNew, texts, activeId, setTexts, currentUser, onLogout, onRemove }) {
  
  function handleSave() {
    const text = texts.find(t => t.id === activeId)
    if (!text) return

    let fileName = text.title;
    if (!fileName) {
      fileName = prompt('הכנס שם לשמירת הקובץ:');
      if (!fileName) return;
    }

    const fileKey = `file_${currentUser}_${fileName}`
    localStorage.setItem(fileKey, JSON.stringify({ ...text, title: fileName, owner: currentUser }))
    
    alert(`הקובץ "${fileName}" נשמר בהצלחה!`)
    onRemove(activeId); 
  }

  function handleOpen() {
    const userPrefix = `file_${currentUser}_`
    const keys = Object.keys(localStorage).filter(k => k.startsWith(userPrefix))
    
    if (keys.length === 0) {
      alert('לא נמצאו קבצים שמורים עבורך.')
      return
    }

    const names = keys.map(k => k.replace(userPrefix, ''))
    const fileName = prompt('בחר קובץ לפתיחה:\n' + names.join('\n'))
    if (!fileName) return

    const isAlreadyOpen = texts.find(t => t.title === fileName);
    if (isAlreadyOpen) {
      alert('הקובץ כבר פתוח בתצוגה.');
      return;
    }

    const raw = localStorage.getItem(userPrefix + fileName)
    if (raw) {
      const loaded = JSON.parse(raw)
      setTexts(prev => [...prev, loaded])
    }
  }

  return (
    <div className="toolbar">
      <button className="tool-btn" onClick={onNew}>+ חדש</button>
      <button className="tool-btn" onClick={handleSave}>שמור</button>
      <button className="tool-btn" onClick={handleOpen}>פתח</button>
      
      {/* הכפתור הזה יידחף שמאלה אוטומטית בגלל ה-margin-right: auto ב-CSS */}
      <button className="tool-btn logout-btn" onClick={onLogout}>יציאה</button>
    </div>
  )
}