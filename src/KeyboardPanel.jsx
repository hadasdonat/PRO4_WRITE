import { useState } from 'react'

/**
 * אובייקט הגדרות הפריסה (Layouts) של המקלדת.
 * המבנה בנוי כמערך של שורות, כאשר כל שורה היא מערך של תווים, 
 * מה שמאפשר רינדור דינמי וגמיש של המקלדת.
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
  // ניהול מצב מקומי עבור השפה הפעילה ותצוגת הסימנים
  const [currentLang, setCurrentLang] = useState('he');
  const [showSymbols, setShowSymbols] = useState(false);

  // קביעת הפריסה להצגה על פי בחירת המשתמש
  const activeLayout = showSymbols ? 'symbols' : currentLang;

  return (
    <div className="keyboard-container">
      <div className="keyboard-mesh">
        {/* מיפוי ורינדור של שורות המקלדת מתוך אובייקט הנתונים */}
        {LAYOUTS[activeLayout].map((row, rowIndex) => (
          <div key={rowIndex} className={`keyboard-row row-${rowIndex}`}>
            
            {/* מיקום ייעודי למקש ה-Enter בתחילת השורה הרביעית לשיפור ה-UX */}
            {rowIndex === 3 && (
              <button className="key enter-key" onClick={() => onKey('\n')}>
                Enter
              </button>
            )}

            {/* רינדור המקשים של השורה הנוכחית */}
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
        
        {/* שורת הפעולות התחתונה (פונקציות מערכת) */}
        <div className="keyboard-row bottom-row">
          {/* כפתור החלפת שפה (מוסתר כאשר מוצגים סימנים) */}
          <button 
            className="key function-key" 
            onClick={() => !showSymbols && setCurrentLang(prev => prev === 'he' ? 'en' : 'he')}
            style={{ visibility: showSymbols ? 'hidden' : 'visible' }}
          >
            {currentLang === 'he' ? 'EN' : 'עב'}
          </button>

          {/* מקש רווח מרכזי */}
          <button className="key space-key" onClick={() => onKey(' ')}>רווח</button>

          {/* מעבר בין פריסת אותיות לפריסת סימנים ומספרים */}
          <button className="key function-key" onClick={() => setShowSymbols(!showSymbols)}>
            {showSymbols ? 'ABC' : '.?123'}
          </button>
        </div>
      </div>
    </div>
  )
}