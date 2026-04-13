import { useState } from 'react'
import StyleControls from './StyleControls'
import KeyboardPanel from './KeyboardPanel'

export default function EditorPanel({ onAddChar, onDelete, onDeleteWord, onClear, onApplyToAll, onUndo }) {
  const [style, setStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
  })

  function handleKey(char) {
    onAddChar(char, { ...style })
  }

  return (
    <div className="editor-panel">
      <StyleControls 
        style={style} 
        onChange={setStyle} 
        onDelete={onDelete} 
        onDeleteWord={onDeleteWord}
        onClear={onClear} 
        onApplyToAll={() => onApplyToAll(style)}
        onUndo={onUndo}
      />
      <KeyboardPanel onKey={handleKey} />
    </div>
  )
}