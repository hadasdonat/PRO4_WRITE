/**
 * קומפוננטת TextCard מייצגת מסמך בודד בתוך אזור התצוגה.
 * הכרטיסייה מציגה תצוגה מקדימה של תוכן המסמך ומאפשרת בחירה או סגירה שלו.
 */
export default function TextCard({ text, isActive, onSelect, onClose }) {
  return (
    <div
      /* שימוש ב-Template Literals להחלת מחלקה דינמית עבור המסמך הנבחר (Active State) */
      className={`text-card ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <span className="card-title">{text.title}</span>
        
        {/* כפתור סגירת הכרטיסייה */}
        <button
          className="close-btn"
          onClick={e => { 
            /* מניעת פעפוע (Propagation): מבטיח שלחיצה על ה-X 
               רק תסגור את הכרטיסייה ולא תפעיל את ה-onSelect של הכרטיס כולו.
            */
            e.stopPropagation(); 
            onClose(); 
          }}
        >✕</button>
      </div>

      <div className="card-content">
        {/* רינדור מותנה: הצגת הודעת עזר אם המסמך ריק, או רינדור התוכן הקיים */}
        {text.content.length === 0
          ? <span className="empty-hint">פה עוד אין טקסט...</span>
          : text.content.map((item, i) => (
              /* מימוש ליבת העורך הוויזואלי: כל תו מרונדר כאלמנט עצמאי (span)
                 המקבל את אובייקט ה-Style הייחודי שנשמר עבורו ב-State.
              */
              <span key={i} style={item.style}>{item.char}</span>
            ))
        }
      </div>
    </div>
  )
}