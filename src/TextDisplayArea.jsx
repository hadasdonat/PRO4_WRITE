import TextCard from './TextCard'

/**
 * קומפוננטת TextDisplayArea משמשת כקונטיינר הראשי להצגת המסמכים הפתוחים.
 * היא אחראית על רינדור רשימת הכרטיסיות (Cards) וניהול האינטראקציה מולן.
 */
export default function TextDisplayArea({ texts, activeId, onSelect, onClose }) {
  return (
    <div className="display-area">
      {/* מיפוי מערך הטקסטים ליצירת כרטיסיית תצוגה עבור כל מסמך בזיכרון.
        שימוש בפונקציית map מאפשר יצירת ממשק דינמי המתעדכן אוטומטית עם כל שינוי ב-State.
      */}
      {texts.map(text => (
        <TextCard
          /* מפתח ייחודי (Key) חיוני לביצועי הרינדור ב-React. 
            מאפשר ל-Virtual DOM לזהות איזה פריט ברשימה השתנה, נוסף או הוסר.
          */
          key={text.id}
          text={text}
          // חיווי ויזואלי לכרטיסייה הפעילה על סמך השוואת ה-ID ל-ActiveId המרכזי
          isActive={text.id === activeId}
          // העברת פונקציות הטיפול (Callbacks) לביצוע שינויים ברמת האפליקציה (Lifting State Up)
          onSelect={() => onSelect(text.id)}
          onClose={() => onClose(text.id)}
        />
      ))}
    </div>
  )
}