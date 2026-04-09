import { useState } from 'react'
import StyleControls from './StyleControls'
import KeyboardPanel from './KeyboardPanel'

export default function EditorPanel({ onAddChar, onDelete, onClear }) {
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
      <StyleControls style={style} onChange={setStyle} onDelete={onDelete} onClear={onClear} />
      <KeyboardPanel onKey={handleKey} />
    </div>
  )
}
