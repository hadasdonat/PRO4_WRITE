/**
 * קומפוננטת TextCard מייצגת "חלון עריכה" או קובץ בודד על המסך.
 * זוהי קומפוננטת תצוגה "טיפשה" המקבלת את כל המידע והפעולות שלה כ-Props.
 */
export default function TextCard({ 
  text,           // אובייקט הקובץ הכולל את ה-id, title, ו-content
  isActive,       // דגל בוליאני המציין אם זהו הקובץ שנמצא כרגע בפוקוס/עריכה
  onSelect,       // פונקציה המופעלת בלחיצה על הכרטיסייה כדי להפוך אותה לפעילה
  onClose,        // פונקציה למחיקת/סגירת הקובץ
  highlightIndex  // אינדקס התו שנמצא כרגע בחיפוש (עבור סימון בצהוב)
}) {
  return (
    <div className={`text-card ${isActive ? 'active' : ''}`} onClick={onSelect}>
      
      {/* --- אזור הכותרת וכפתור הסגירה --- */}
      <div className="card-header">
        {/* שימוש באופרטור OR לוגי (||) כדי להציג "ללא שם" אם הכותרת ריקה (Falsey) */}
        <span>{text.title || 'ללא שם'}</span>
        
        {/* חשוב: עצירת פעפוע האירוע (Event Bubbling).
          מכיוון שכפתור הסגירה נמצא בתוך הדיב של הכרטיסייה (שיש לו onClick משלו),
          לחיצה על סגירה הייתה מפעילה גם את ה-onSelect בטעות.
          e.stopPropagation() מבטיח שהלחיצה תטופל רק כאן ולא "תעלה" למעלה לאלמנט האב.
        */}
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
      </div>

      {/* --- אזור תצוגת הטקסט --- */}
      <div className="card-content">
        {/* רינדור מערך התווים. כל תו מקבל אלמנט <span> נפרד,
          כדי שנוכל להחיל עליו עיצוב (Style) נקודתי ושונה משאר התווים.
        */}
        {text.content.map((item, i) => (
          <span 
            key={i} 
            style={{
              ...item.style, // פריסת אובייקט העיצוב המקורי שנשמר לתו
              
              // לוגיקת הדגשת חיפוש: עוקפת את עיצוב המקור רק אם הקובץ פעיל והאינדקס תואם
              backgroundColor: (isActive && highlightIndex === i) ? '#ffff00' : 'transparent',
              border: (isActive && highlightIndex === i) ? '1px solid orange' : 'none'
            }}
          >
            {/* טיפול ברווחים: HTML רגיל "מכווץ" רצף של רווחים לרווח אחד בלבד.
              לכן, אם התו הוא רווח (' '), אנחנו ממירים אותו ל-Non-Breaking Space (\u00A0).
              זה מכריח את הדפדפן לרנדר את הרווח המדויק שהמשתמש הקליד.
            */}
            {item.char === ' ' ? '\u00A0' : item.char}
          </span>
        ))}
      </div>
    </div>
  );
}