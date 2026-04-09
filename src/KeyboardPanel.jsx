import { useState } from 'react'

const LAYOUTS = {
  en: [
    'q','w','e','r','t','y','u','i','o','p',
    'a','s','d','f','g','h','j','k','l',';',
    'z','x','c','v','b','n','m',',','.','/',
    '1','2','3','4','5','6','7','8','9','0',
  ],
  he: [
    'ק','ר','א','ט','ו','ן','ם','פ','ש','ד',
    'ג','כ','ע','י','ח','ל','ך','ף','ז','ס',
    'ב','ה','נ','מ','צ','ת','ץ',',','.','/',
    '1','2','3','4','5','6','7','8','9','0',
  ],
  emoji: [
    '😊','😂','❤️','👍','🎉','✨','😍','🔥','😎','💡',
    '🙏','💪','🤔','😢','👋','🌟','🎶','💬','📌','🚀',
    '💥','🌈','🎯','😴','🤩','😅','🥳','💫','🎁','🌸',
  ]
}

export default function KeyboardPanel({ onKey }) {
  const [lang, setLang] = useState('en')

  return (
    <div className="keyboard-panel">
      <div className="lang-tabs">
        {Object.keys(LAYOUTS).map(l => (
          <button
            key={l}
            className={`lang-tab ${lang === l ? 'active' : ''}`}
            onClick={() => setLang(l)}
          >
            {l === 'en' ? 'EN' : l === 'he' ? 'עב' : '☺'}
          </button>
        ))}
      </div>

      <div className="keyboard">
        {LAYOUTS[lang].map((key, i) => (
          <button key={i} className="key" onClick={() => onKey(key)}>
            {key}
          </button>
        ))}
        <button className="key space-key" onClick={() => onKey(' ')}>
          רווח
        </button>
      </div>
    </div>
  )
}
