import { useState } from 'react'

const LAYOUTS = {
  he: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['ש','ק','ר','א','ט','ו','ן','ם','פ','ף'],
    ['ז','ד','ג','כ','ע','י','ח','ל','ך'],
    ['ס','ב','ה','נ','מ','צ','ת','ץ'] // שורה 3 (אינדקס 3)
  ],
  en: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'] // שורה 3 (אינדקס 3)
  ],
  symbols: [ 
    ['1','2','3','4','5','6','7','8','9','0'],
    ['?','!','@','#','$','%','^','&','*','('],
    [')','-','_','+','=','[',']','{','}',';'],
    [':',"'",'"','\\','|','<','>','/'] // שורה 3 (אינדקס 3)
  ]
}

export default function KeyboardPanel({ onKey }) {
  const [currentLang, setCurrentLang] = useState('he');
  const [showSymbols, setShowSymbols] = useState(false);

  const activeLayout = showSymbols ? 'symbols' : currentLang;

  return (
    <div className="keyboard-container">
      <div className="keyboard-mesh">
        {LAYOUTS[activeLayout].map((row, rowIndex) => (
          <div key={rowIndex} className={`keyboard-row row-${rowIndex}`}>
            
            {/* הוספת מקש Enter בתחילת השורה הרביעית (אינדקס 3) */}
            {rowIndex === 3 && (
              <button className="key enter-key" onClick={() => onKey('\n')}>
                Enter
              </button>
            )}

            {row.map((key, keyIndex) => (
              <button key={`${activeLayout}-${rowIndex}-${keyIndex}`} className="key" onClick={() => onKey(key)}>
                {key}
              </button>
            ))}
          </div>
        ))}
        
        <div className="keyboard-row bottom-row">
          <button 
            className="key function-key" 
            onClick={() => !showSymbols && setCurrentLang(prev => prev === 'he' ? 'en' : 'he')}
            style={{ visibility: showSymbols ? 'hidden' : 'visible' }}
          >
            {currentLang === 'he' ? 'EN' : 'עב'}
          </button>

          <button className="key space-key" onClick={() => onKey(' ')}>רווח</button>

          <button className="key function-key" onClick={() => setShowSymbols(!showSymbols)}>
            {showSymbols ? 'ABC' : '.?123'}
          </button>
        </div>
      </div>
    </div>
  )
}