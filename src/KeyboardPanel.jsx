import { useState } from 'react'

/**
 * אובייקט הקבועים המגדיר את פריסות המקשים (Layouts).
 * השימוש במבנה של מערכים מקוננים מאפשר גישה מבוססת נתונים (Data-driven design),
 * מה שמקל על הוספת שפות או שינוי סדר המקשים ללא שינוי הלוגיקה של הרינדור.
 */
const LAYOUTS = {
  he: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['ש','ק','ר','א','ט','ו','ן','ם','פ','ף'],
    ['ז','ד','ג','כ','ע','י','ח','ל','ך'],
    ['ס','ב','ה','נ','מ','צ','ת','ץ'] 
  ],
  en: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'] 
  ],
  symbols: [ 
    ['1','2','3','4','5','6','7','8','9','0'],
    ['?','!','@','#','$','%','^','&','*','('],
    [')','-','_','+','=','[',']','{','}',';'],
    [':',"'",'"','\\','|','<','>','/'] 
  ]
}

export default function KeyboardPanel({ onKey }) {
  // ניהול מצב מקומי לשפה (עברית/אנגלית) ולמצב תצוגת סימנים
  const [currentLang, setCurrentLang] = useState('he');
  const [showSymbols, setShowSymbols] = useState(false);

  // קביעה דינמית של הפריסה הפעילה על פי שילוב המצבים הנוכחי
  const activeLayout = showSymbols ? 'symbols' : currentLang;

  return (
    <div className="keyboard-container">
      <div className="keyboard-mesh">
        
        {/* רינדור דינמי של המקלדת באמצעות מיפוי כפול (Nested Mapping) על המערכים */}
        {LAYOUTS[activeLayout].map((row, rowIndex) => (
          <div key={rowIndex} className={`keyboard-row row-${rowIndex}`}>
            
            {/* הוספת מקש ה-Enter באופן מותנה בשורה האחרונה של האותיות */}
            {rowIndex === 3 && (
              <button className="key enter-key" onClick={() => onKey('\n')}>
                Enter
              </button>
            )}

            {/* מעבר על כל תו במערך השורה ויצירת כפתור תואם */}
            {row.map((key, keyIndex) => (
              <button 
                key={`${activeLayout}-${rowIndex}-${keyIndex}`} 
                className="key" 
                onClick={() => onKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        
        {/* שורת פונקציות תחתונה לניהול הגדרות המקלדת בזמן אמת */}
        <div className="keyboard-row bottom-row">
          
          {/* כפתור החלפת שפה: פעיל רק כאשר לא נמצאים במצב סימנים */}
          <button 
            className="key function-key" 
            onClick={() => !showSymbols && setCurrentLang(prev => prev === 'he' ? 'en' : 'he')}
            style={{ visibility: showSymbols ? 'hidden' : 'visible' }}
          >
            {currentLang === 'he' ? 'EN' : 'עב'}
          </button>

          {/* מקש רווח השולח תו ריק לפונקציית העדכון ב-App */}
          <button className="key space-key" onClick={() => onKey(' ')}>רווח</button>

          {/* כפתור Toggle למעבר בין מצב תווים אלפא-נומריים לסימנים מיוחדים */}
          <button className="key function-key" onClick={() => setShowSymbols(!showSymbols)}>
            {showSymbols ? 'ABC' : '.?123'}
          </button>
        </div>
      </div>
    </div>
  )
}