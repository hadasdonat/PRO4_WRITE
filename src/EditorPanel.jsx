import StyleControls from './StyleControls'
import KeyboardPanel from './KeyboardPanel'

/**
 * קומפוננטת מעטפת (Wrapper Component) לאזור העריכה התחתון.
 * תפקידה העיקרי הוא לרכז את כלי העיצוב (StyleControls) ואת המקלדת (KeyboardPanel),
 * ולנתב את הפעולות (Props) שמגיעות מה-App המרכזי אל תתי-הרכיבים המתאימים.
 */
export default function EditorPanel({ 
  style,          // מצב העיצוב הנוכחי (משמש כמקור אמת עבור המקלדת כולה)
  onChange,       // פונקציה לעדכון העיצוב ב-App המרכזי
  onAddChar,      // פונקציה לדחיפת תו חדש למערך התוכן של הקובץ
  onDelete,       // מחיקת תו אחרון
  onDeleteWord,   // מחיקת מילה (הלוגיקה המורכבת של החיתוך שמומשה ב-App)
  onClear,        // איפוס כל תוכן הקובץ
  onApplyToAll,   // החלת העיצוב הנוכחי על כל התווים הקיימים בקובץ
  onUndo,         // שליפת המצב הקודם ממחסנית ההיסטוריה
  onFindReplace   // שינוי ה-State שפותח את סרגל החיפוש העליון
}) {
  
  /**
   * פונקציית תווך (Handler) לטיפול בלחיצת מקלדת.
   * המקלדת (KeyboardPanel) יודעת רק איזה תו נלחץ, אבל היא לא מודעת לעיצוב.
   * הפונקציה הזו "משדכת" בין התו שנלחץ לבין הסטייל הפעיל באותו רגע,
   * ושולחת את שניהם יחד כאובייקט אחד ל-App.
   */
  function handleKey(char) {
    onAddChar(char, style)
  }

  return (
    <div className="editor-panel">
      {/* אזור הפקודות והעיצוב - מקבל את כל הפונקציות בשיטת Prop Drilling */}
      <StyleControls 
        style={style} 
        onChange={onChange} 
        onDelete={onDelete} 
        onDeleteWord={onDeleteWord} // העברת הפרופ הלאה לכפתור המחיקה
        onClear={onClear} 
        
        // עוטפים את onApplyToAll כדי להזריק לתוכה את הסטייל הנוכחי ברגע הלחיצה
        onApplyToAll={() => onApplyToAll(style)}
        
        onUndo={onUndo}
        onFindReplace={onFindReplace}
      />
      
      {/* אזור המקלדת הוירטואלית - מתקשר רק דרך פונקציית התווך שלנו */}
      <KeyboardPanel onKey={handleKey} />
    </div>
  )
}