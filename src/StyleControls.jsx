import { useState } from 'react'

/**
 * הגדרות קבועות עבור אפשרויות העיצוב במערכת.
 * הפרדת הנתונים מהלוגיקה מאפשרת תחזוקה קלה והרחבה עתידית של רשימת הפונטים והגדלים.
 */
const FONTS = ['Arial', 'Georgia', 'Courier New', 'Tahoma', 'Verdana', 'Times New Roman']
const SIZES = ['10', '12', '14', '16', '18', '24', '32', '48']

/**
 * קומפוננטת StyleControls אחראית על ממשק העריכה הוויזואלי.
 * היא מנהלת את איסוף פרמטרי העיצוב מהמשתמש ומפעילה פונקציות Callback (Props) 
 * כדי לעדכן את המידע ב-State המרכזי של האפליקציה.
 */
export default function StyleControls({ style, onChange, onDelete, onDeleteWord, onClear, onApplyToAll, onUndo }) {
  
  /**
   * פונקציית עזר לעדכון ערך ספציפי באובייקט העיצוב.
   * משתמשת בסינטקס של Computed Property Names כדי לעדכן שדות בצורה דינמית.
   */
  function update(key, value) {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  /**
   * לוגיקת Switch עבור עיצובים בינאריים (כמו Bold או Italic).
   * בודקת את המצב הנוכחי ומחליפה בין ערך פעיל לערך ברירת מחדל (Normal).
   */
  function toggle(key, onVal, offVal) {
    onChange(prev => ({ ...prev, [key]: prev[key] === onVal ? offVal : onVal }))
  }

  return (
    <div className="style-controls">
      {/* בחירת גופן - סנכרון מול ה-State המקומי ב-EditorPanel */}
      <select value={style.fontFamily} onChange={e => update('fontFamily', e.target.value)}>
        {FONTS.map(f => <option key={f}>{f}</option>)}
      </select>

      {/* בחירת גודל טקסט - המרה של ערך מספרי ליחידות px */}
      <select value={parseInt(style.fontSize)} onChange={e => update('fontSize', e.target.value + 'px')}>
        {SIZES.map(s => <option key={s}>{s}</option>)}
      </select>

      {/* בחירת צבע באמצעות Color Picker ייעודי */}
      <input type="color" value={style.color} onChange={e => update('color', e.target.value)} />

      {/* כפתורי עיצוב טקסט (B, I) עם חיווי ויזואלי למצב פעיל (Active Class) */}
      <button 
        className={`fmt-btn ${style.fontWeight === 'bold' ? 'active' : ''}`} 
        onClick={() => toggle('fontWeight', 'bold', 'normal')}
      >
        B
      </button>
      
      <button 
        className={`fmt-btn ${style.fontStyle === 'italic' ? 'active' : ''}`} 
        onClick={() => toggle('fontStyle', 'italic', 'normal')}
      >
        I
      </button>
      
      <div className="sep"></div>

      {/* פקודות עריכה המועברות מה-App: החלת עיצוב גורף, Undo ומחיקות */}
      <button className="action-btn" onClick={onApplyToAll} title="החל עיצוב על כל הטקסט">הכל</button>
      <button className="action-btn" onClick={onUndo}>Undo</button>
      <button className="action-btn" onClick={onDelete}>מחק</button>
      <button className="action-btn" onClick={onDeleteWord}>מחק מילה</button>
      
      {/* כפתור איפוס כללי - מעוצב בצורה בולטת למניעת לחיצות שגויות */}
      <button className="action-btn danger" onClick={onClear}>נקה</button>
    </div>
  )
}