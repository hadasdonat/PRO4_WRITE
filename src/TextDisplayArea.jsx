import TextCard from './TextCard';

/**
 * קומפוננטת מעטפת (Container) שאחראית להציג את כל הקבצים הפתוחים.
 * היא לא מנהלת לוגיקה מורכבת בעצמה, אלא רק מקבלת נתונים מה-App 
 * ומפזרת אותם לכרטיסיות (TextCard) המתאימות (Prop Drilling).
 */
export default function TextDisplayArea({ 
  texts = [],     // ברירת מחדל: מערך ריק, כדי למנוע שגיאה אם ה-App שולח בטעות undefined
  activeId,       // ה-ID של הקובץ שעורכים כרגע
  onSelect, 
  onClose, 
  highlightIndex,
  cursorIndex,
  onSetCursor     // קבלת פונקציית עדכון הסמן מה-App
}) {
  
  // הגנה מקריסה (Defensive Programming):
  // אם מסיבה כלשהי texts הוא לא מערך (למשל שגיאה בקריאה מה-LocalStorage), 
  // נציג הודעת טעינה במקום שהאפליקציה תקרוס ("מסך לבן").
  if (!texts || !Array.isArray(texts)) {
    return <div className="text-display-area">טוען קבצים...</div>;
  }

  return (
    <div className="text-display-area" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '20px' }}>
      
      {/* רינדור מותנה: אם אין קבצים נציג הודעה, אחרת נצייר את הכרטיסיות */}
      {texts.length === 0 ? (
        <div className="empty-state-hint">לא נמצאו קבצים פתוחים</div>
      ) : (
        texts.map((t) => (
          <TextCard
            // מפתח ייחודי (key) הוא חובה ב-React כשמרנדרים רשימה עם map.
            // זה עוזר ל-React לעדכן את המסך מהר יותר כשקובץ מתווסף או נמחק.
            key={t.id}
            
            text={t}
            isActive={t.id === activeId}
            
            // אנחנו עוטפים את הפונקציות (Closure) כדי שכשילחצו עליהן בתוך TextCard,
            // הן יפעלו מיד עם ה-ID הספציפי של הקובץ הזה.
            onSelect={() => onSelect(t.id)}
            onClose={() => onClose(t.id)}
            
            highlightIndex={highlightIndex}
            cursorIndex={cursorIndex}
            onSetCursor={onSetCursor} // מעבירים את הצינור הלאה אל ה-TextCard
          />
        ))
      )}
    </div>
  );
}