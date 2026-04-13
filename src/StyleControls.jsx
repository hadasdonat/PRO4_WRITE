import { useState } from 'react'

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Tahoma', 'Verdana', 'Times New Roman']
const SIZES = ['10', '12', '14', '16', '18', '24', '32', '48']

export default function StyleControls({ style, onChange, onDelete, onDeleteWord, onClear, onApplyToAll, onUndo }) {
  function update(key, value) {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  function toggle(key, onVal, offVal) {
    onChange(prev => ({ ...prev, [key]: prev[key] === onVal ? offVal : onVal }))
  }

  return (
    <div className="style-controls">
      <select value={style.fontFamily} onChange={e => update('fontFamily', e.target.value)}>
        {FONTS.map(f => <option key={f}>{f}</option>)}
      </select>

      <select value={parseInt(style.fontSize)} onChange={e => update('fontSize', e.target.value + 'px')}>
        {SIZES.map(s => <option key={s}>{s}</option>)}
      </select>

      <input type="color" value={style.color} onChange={e => update('color', e.target.value)} />

      <button className={`fmt-btn ${style.fontWeight === 'bold' ? 'active' : ''}`} onClick={() => toggle('fontWeight', 'bold', 'normal')}>B</button>
      <button className={`fmt-btn ${style.fontStyle === 'italic' ? 'active' : ''}`} onClick={() => toggle('fontStyle', 'italic', 'normal')}>I</button>
      
      <div className="sep"></div>

      <button className="action-btn" onClick={onApplyToAll} title="החל עיצוב על כל הטקסט">הכל</button>
      <button className="action-btn" onClick={onUndo}>Undo</button>
      <button className="action-btn" onClick={onDelete}>מחק</button>
      <button className="action-btn" onClick={onDeleteWord}>מחק מילה</button>
      <button className="action-btn danger" onClick={onClear}>נקה</button>
    </div>
  )
}