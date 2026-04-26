import TextCard from './TextCard';

/**
 * קומפוננטת אזור התצוגה (TextDisplayArea).
 * מתפקדת כ-"Container Component" שאחראי לרנדר את רשימת המסמכים ככרטיסיות.
 * מנהלת את הפריסה הוויזואלית הכוללת ומעבירה את ה-Props (Prop Drilling) לכל כרטיסייה.
 */
export default function TextDisplayArea({ 
  // שימוש בערך ברירת מחדל (Default Parameter) של ES6 
  // כדי להבטיח שתמיד יהיה מערך גם אם ה-App שולח undefined, מה שמונע שגיאת map מתסכלת.
  texts = [], 
  activeId, 
  onSelect, 
  onClose, 
  highlightIndex 
}) {
  
  /**
   * תכנות מגננתי (Defensive Programming):
   * בדיקת תקינות הקלט (Type Checking) לוודא ש-texts הוא אכן מערך חוקי.
   * זה מגן על האפליקציה מקריסה מוחלטת ("מסך לבן") במקרה של שגיאת קריאה מה-LocalStorage.
   */
  if (!texts || !Array.isArray(texts)) {
    return <div className="text-display-area">טוען קבצים...</div>;
  }

  return (
    <div className="text-display-area" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '20px' }}>
      
      {/* רינדור מותנה (Conditional Rendering): 
          אם המערך ריק - נציג חיווי של מצב ריק (Empty State).
          אחרת - נמפה את המערך ונרנדר קומפוננטת TextCard עבור כל אובייקט.
      */}
      {texts.length === 0 ? (
        <div className="empty-state-hint">לא נמצאו קבצים פתוחים</div>
      ) : (
        texts.map((t) => (
          <TextCard
            // הוספת מפתח (key) ייחודי היא חובה ב-React עבור רשימות דינמיות.
            // זה מאפשר לאלגוריתם של React (Reconciliation) לזהות ביעילות אילו פריטים נוספו, שונו או נמחקו.
            key={t.id}
            
            text={t}
            
            // חישוב בוליאני: האם הכרטיסייה הזו היא הפעילה?
            isActive={t.id === activeId}
            
            // עטיפת הפונקציות בפונקציית חץ (Closure) מבטיחה שנעביר למעלה את ה-ID הספציפי של הלחיצה
            onSelect={() => onSelect(t.id)}
            onClose={() => onClose(t.id)}
            
            // מעבירים את אינדקס החיפוש פנימה כדי שהכרטיסייה תדע מה לסמן בצהוב
            highlightIndex={highlightIndex}
          />
        ))
      )}
    </div>
  );
}