import { useState } from 'react'
import StyleControls from './StyleControls'
import KeyboardPanel from './KeyboardPanel'

/**
 * קומפוננטת EditorPanel מרכזת את כל כלי העריכה וההקלדה של המערכת.
 * תפקידה העיקרי הוא לנהל את מצב העיצוב הנוכחי (Style) ולתווך בין בחירות המשתמש לבין הוספת התוכן.
 */
export default function EditorPanel({ onAddChar, onDelete, onDeleteWord, onClear, onApplyToAll, onUndo, onFindReplace }) {
  
  // ניהול המצב המקומי של העיצוב הנבחר (פונט, גודל, צבע וכו')
  // המידע הזה מוצמד לכל תו שייכתב מרגע הבחירה ואילך
  const [style, setStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
  })

  /**
   * פונקציית תיווך להקלדת תווים.
   * משלבת את התו שהתקבל מהמקלדת יחד עם אובייקט העיצוב הנוכחי שנשמר ב-State.
   */
  function handleKey(char) {
    // שליחת התו והעיצוב לקומפוננטת האב (App) לצורך עדכון המסמך הפעיל
    onAddChar(char, { ...style })
  }

  return (
    <div className="editor-panel">
      {/* סרגל ניהול הסגנונות ופעולות המחיקה/Undo */}
      <StyleControls 
        style={style} 
        onChange={setStyle} 
        onDelete={onDelete} 
        onDeleteWord={onDeleteWord}
        onClear={onClear} 
        onApplyToAll={() => onApplyToAll(style)}
        onUndo={onUndo}
        onFindReplace={onFindReplace}
      />

      {/* המקלדת הוויזואלית האחראית על הפקת התווים */}
      <KeyboardPanel onKey={handleKey} />
    </div>
  )
}