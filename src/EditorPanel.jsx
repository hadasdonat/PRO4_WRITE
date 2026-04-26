import StyleControls from './StyleControls'
import KeyboardPanel from './KeyboardPanel'

export default function EditorPanel({ 
  style,          // מגיע מה-App
  onChange,       // מגיע מה-App
  onAddChar, 
  onDelete, 
  onClear, 
  onApplyToAll, 
  onUndo, 
  onFindReplace 
}) {
  
  function handleKey(char) {
    // משתמש בסטייל שה-App שלח
    onAddChar(char, style)
  }

  return (
    <div className="editor-panel">
      <StyleControls 
        style={style} 
        onChange={onChange} 
        onDelete={onDelete} 
        onClear={onClear} 
        onApplyToAll={() => onApplyToAll(style)}
        onUndo={onUndo}
        onFindReplace={onFindReplace}
      />
      <KeyboardPanel onKey={handleKey} />
    </div>
  )
}