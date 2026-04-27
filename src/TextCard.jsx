/**
 * קומפוננטת TextCard מייצגת "חלון עריכה" או קובץ בודד על המסך.
 * תפקידה לקחת את מערך התווים (text.content) ולצייר אותו על המסך,
 * כולל הטיפול בסמן המהבהב (Cursor) ובלחיצות עכבר לשינוי מיקום העריכה.
 */
export default function TextCard({ 
  text,           // אובייקט הקובץ (מכיל id, title, ו-content שהוא מערך התווים)
  isActive,       // משתנה בוליאני: האם הכרטיסייה הזו היא זו שנבחרה כרגע?
  onSelect,       // פונקציה לבחירת הכרטיסייה (הופכת אותה לפעילה)
  onClose,        // פונקציה לסגירת/מחיקת הכרטיסייה
  highlightIndex, // אינדקס התו שנמצא כרגע בחיפוש (לצורך צביעת הרקע שלו בצהוב)
  cursorIndex,    // המיקום הנוכחי של הסמן המהבהב (אינדקס במערך)
  onSetCursor     // פונקציה המעדכנת את מיקום הסמן ב-App המרכזי
}) {
  return (
    <div className={`text-card ${isActive ? 'active' : ''}`} onClick={onSelect}>
      
      {/* --- אזור הכותרת וכפתור הסגירה --- */}
      <div className="card-header">
        <span>{text.title || 'ללא שם'}</span>
        
        {/* כפתור מחיקת קובץ:
            משתמשים ב-e.stopPropagation() כדי למנוע "פעפוע אירועים" (Event Bubbling).
            בלעדיו, לחיצה על ה-X הייתה גם מפעילה את ה-onClick של כל הכרטיסייה (onSelect).
        */}
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
      </div>

      {/* --- אזור תצוגת הטקסט המרכזי --- 
          הוספנו onClick כללי על אזור התוכן: אם המשתמש לוחץ על "שטח מת" (אזור ריק בכרטיסייה),
          הסמן יקפוץ אוטומטית לסוף הטקסט, בדיוק כמו שקורה בעורכי טקסט אמיתיים.
      */}
      <div 
        className="card-content" 
        style={{ position: 'relative', whiteSpace: 'pre-wrap', cursor: 'text', minHeight: '100px' }}
        onClick={() => {
          if (isActive) onSetCursor(text.content.length);
        }}
      >
        
        {/* מעבר בלולאה (map) על כל מערך התווים שיש בקובץ.
            כל תו מקבל "עטיפה" משלו כדי שנוכל להחיל עליו עיצוב או סמן בצורה פרטנית.
        */}
        {text.content.map((item, i) => (
          <span 
            key={i} 
            className="char-unit" 
            style={{ display: 'inline-flex', alignItems: 'center' }}
            
            // --- לחיצה על תו ספציפי ---
            // כאן מתבצעת הלוגיקה שמאפשרת עריכה מאמצע משפט.
            onClick={(e) => {
              e.stopPropagation(); // מונע מהלחיצה להפעיל את הקפיצה לסוף הטקסט (מוגדר ב-div העוטף)
              onSelect();          // מוודא שהכרטיסייה הופכת לפעילה אם היא לא הייתה
              onSetCursor(i);      // שולח ל-App את האינדקס המדויק של האות שלחצנו עליה
            }}
          >
            
            {/* 1. הזרקת הסמן (Cursor):
                בודק 3 תנאים:
                א. האם הכרטיסייה פעילה?
                ב. האם המיקום הנוכחי של הסמן ב-App שווה לאינדקס של האות הזו בתוך הלולאה?
                אם כן -> מצייר קו מהבהב לפני האות.
            */}
            {isActive && cursorIndex === i && <span className="blinking-cursor"></span>}
            
            {/* 2. הזרקת התו עצמו:
                כאן אנו לוקחים את העיצוב השמור של התו (item.style) ומשלבים אותו עם עיצוב
                מותנה לתוצאות חיפוש (רקע צהוב למילה שנמצאה).
            */}
            <span 
              style={{
                ...item.style, // פריסת אובייקט העיצוב מהזיכרון (fontFamily, color וכו')
                backgroundColor: (isActive && highlightIndex === i) ? '#ffff00' : 'transparent',
                border: (isActive && highlightIndex === i) ? '1px solid orange' : 'none',
              }}
            >
              {/* טיפול ברווחים:
                  דפדפנים נוטים "לבלוע" רווחים לבנים רגילים (' ').
                  לכן, אם התו הוא רווח, אנו ממירים אותו לרווח קשיח ב-HTML (\u00A0) כדי שיוצג תמיד.
              */}
              {item.char === ' ' ? '\u00A0' : item.char}
            </span>
          </span>
        ))}

        {/* 3. סמן בסוף הטקסט:
            בדיקה נוספת שרצה מחוץ ללולאת ה-map.
            אם הסמן נמצא במיקום שהוא בדיוק בגודל של כל המערך (כלומר, אחרי האות האחרונה),
            אנו מציירים אותו כאן בסוף.
        */}
        {isActive && cursorIndex === text.content.length && (
          <span className="blinking-cursor"></span>
        )}
      </div>
    </div>
  );
}