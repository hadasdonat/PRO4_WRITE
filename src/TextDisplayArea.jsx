import TextCard from './TextCard';

/**
 * קומפוננטה המציגה את כל המסמכים הפתוחים ככרטיסיות.
 * כוללת הגנה מפני 'דף לבן' במקרה של נתונים חסרים.
 */
export default function TextDisplayArea({ 
  texts = [], // ברירת מחדל של מערך ריק למניעת קריסה
  activeId, 
  onSelect, 
  onClose, 
  highlightIndex 
}) {
  
  // הגנה: אם texts לא הגיע או שהוא לא מערך, נציג הודעה במקום לקרוס
  if (!texts || !Array.isArray(texts)) {
    return <div className="text-display-area">טוען קבצים...</div>;
  }

  return (
    <div className="text-display-area" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '20px' }}>
      {texts.length === 0 ? (
        <div className="empty-state-hint">לא נמצאו קבצים פתוחים</div>
      ) : (
        texts.map((t) => (
          <TextCard
            key={t.id}
            text={t}
            isActive={t.id === activeId}
            onSelect={() => onSelect(t.id)}
            onClose={() => onClose(t.id)}
            // הצינור שמעביר את אינדקס החיפוש לכרטיסייה
            highlightIndex={highlightIndex}
          />
        ))
      )}
    </div>
  );
}