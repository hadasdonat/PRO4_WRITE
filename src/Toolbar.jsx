export default function Toolbar({ onNew, texts, activeId, setTexts }) {
  function handleSave() {
    const text = texts.find(t => t.id === activeId)
    if (!text) return
    const name = prompt('שם הקובץ לשמירה:', text.title)
    if (!name) return
    localStorage.setItem('file_' + name, JSON.stringify(text))
    alert(`נשמר בהצלחה: "${name}"`)
  }

  function handleOpen() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('file_'))
    if (keys.length === 0) { alert('אין קבצים שמורים'); return }
    const names = keys.map(k => k.replace('file_', ''))
    const name = prompt('בחר קובץ לפתיחה:\n' + names.join('\n'))
    if (!name) return
    const raw = localStorage.getItem('file_' + name)
    if (!raw) { alert('קובץ לא נמצא'); return }
    const loaded = JSON.parse(raw)
    setTexts(prev => {
      const exists = prev.find(t => t.id === loaded.id)
      return exists ? prev.map(t => t.id === loaded.id ? loaded : t) : [...prev, loaded]
    })
  }

  return (
    <div className="toolbar">
      <span className="app-title">✏️ עורך טקסטים</span>
      <div className="toolbar-actions">
        <button onClick={onNew}>+ חדש</button>
        <button onClick={handleSave}>💾 שמור</button>
        <button onClick={handleOpen}>📂 פתח</button>
      </div>
    </div>
  )
}
