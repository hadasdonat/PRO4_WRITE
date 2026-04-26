import { useState } from 'react'

// הגדרת קבועים מחוץ לקומפוננטה מונעת יצירה מחדש של המערכים בכל רינדור (Render) של המסך
const FONTS = ['Arial', 'Georgia', 'Courier难 New', 'Tahoma', 'Verdana', 'Times New Roman']
const SIZES = ['10', '12', '14', '16', '18', '24', '32', '48']

/**
 * קומפוננטת StyleControls מנהלת את ממשק העיצוב והפעולות של העורך.
 * היא מקבלת את מצב העיצוב הנוכחי (style) ואוסף של פונקציות Callback מה-App,
 * ומקשרת אותם לכפתורים ולפקדים הוויזואליים שעל המסך.
 */
export default function StyleControls({ 
  style, 
  onChange, 
  onDelete, 
  onDeleteWord, 
  onClear, 
  onApplyToAll, 
  onUndo,
  onFindReplace // הפעלת מצב החיפוש ב-App
}) {
  
  /**
   * פונקציית עזר לעדכון ערך בודד באובייקט העיצוב.
   * משתמשת בתחביר פירוק (Spread Operator) כדי לשמור על שאר התכונות הקיימות
   * ודורסת רק את המפתח (key) הספציפי שקיבלה עם הערך החדש (value).
   */
  function update(key, value) {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  /**
   * פונקציית עזר למיתוג (Toggle) של תכונות בעלות שני מצבים (כמו מודגש או נטוי).
   * בודקת אם הערך הנוכחי שווה לערך ה"פעיל" - אם כן מכבה אותו, אחרת מדליקה.
   */
  function toggle(key, onVal, offVal) {
    onChange(prev => ({ ...prev, [key]: prev[key] === onVal ? offVal : onVal }))
  }

  return (
    <div className="style-controls">
      
      {/* --- אזור בחירת תכונות טקסט --- */}
      
      {/* בחירת גופן: רינדור דינמי של רשימת האופציות מתוך מערך הקבועים */}
      <select value={style.fontFamily} onChange={e => update('fontFamily', e.target.value)}>
        {FONTS.map(f => <option key={f}>{f}</option>)}
      </select>

      {/* בחירת גודל טקסט: המרה ל-Int לצורך תצוגה נקייה, והוספת 'px' בשמירה ל-State */}
      <select value={parseInt(style.fontSize)} onChange={e => update('fontSize', e.target.value + 'px')}>
        {SIZES.map(s => <option key={s}>{s}</option>)}
      </select>

      {/* בחירת צבע: שימוש בפקד הצבע המובנה של הדפדפן (HTML5 Color Picker) */}
      <input type="color" value={style.color} onChange={e => update('color', e.target.value)} />

      {/* --- אזור כפתורי מיתוג (Toggle) --- */}
      
      {/* כפתור מודגש: הוספת מחלקה 'active' באופן דינמי אם התכונה מופעלת כדי לתת חיווי למשתמש */}
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

      {/* --- אזור פעולות מתקדמות ומחיקה --- */}
      
      <button className="action-btn" onClick={onUndo} title="ביטול פעולה אחרונה">Undo</button>
      
      <button className="action-btn" onClick={onFindReplace} title="חיפוש והחלפה בתוך המסמך">🔍</button>
      
      <button className="action-btn" onClick={onApplyToAll} title="החל עיצוב על כל הטקסט">הכל</button>
      
      <div className="sep"></div>

      <button className="action-btn" onClick={onDelete}>מחק</button>
      <button className="action-btn" onClick={onDeleteWord}>מחק מילה</button>
      
      {/* כפתור מחיקה כללית עם מחלקת עיצוב ייעודית (danger) להתראה אדומה */}
      <button className="action-btn danger" onClick={onClear}>נקה הכל</button>
    </div>
  )
}