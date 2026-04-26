export default function TextCard({ text, isActive, onSelect, onClose, highlightIndex }) {
  return (
    <div className={`text-card ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="card-header">
        <span>{text.title || 'ללא שם'}</span>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
      </div>
      <div className="card-content">
        {text.content.map((item, i) => (
          <span 
            key={i} 
            style={{
              ...item.style,
              // צביעה רק אם זה התו שנבחר בחיפוש
              backgroundColor: (isActive && highlightIndex === i) ? '#ffff00' : 'transparent',
              border: (isActive && highlightIndex === i) ? '1px solid orange' : 'none'
            }}
          >
            {item.char === ' ' ? '\u00A0' : item.char}
          </span>
        ))}
      </div>
    </div>
  );
}