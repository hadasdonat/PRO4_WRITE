import { useState } from 'react'

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Tahoma', 'Verdana', 'Times New Roman']
const SIZES = ['10', '12', '14', '16', '18', '24', '32', '48']

export default function StyleControls({ style, onChange, onDelete, onClear }) {
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

      <input
        type="color"
        value={style.color}
        onChange={e => update('color', e.target.value)}
        title="צבע טקסט"
      />

      <button
        className={`fmt-btn ${style.fontWeight === 'bold' ? 'active' : ''}`}
        onClick={() => toggle('fontWeight', 'bold', 'normal')}
      ><b>B</b></button>

      <button
        className={`fmt-btn ${style.fontStyle === 'italic' ? 'active' : ''}`}
        onClick={() => toggle('fontStyle', 'italic', 'normal')}
      ><i>I</i></button>

      <button
        className={`fmt-btn ${style.textDecoration === 'underline' ? 'active' : ''}`}
        onClick={() => toggle('textDecoration', 'underline', 'none')}
      ><u>U</u></button>

      <div className="sep" />

      <button className="action-btn" onClick={onDelete}>⌫ מחק תו</button>
      <button className="action-btn danger" onClick={onClear}>מחק הכל</button>
    </div>
  )
}
