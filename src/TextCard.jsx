export default function TextCard({ text, isActive, onSelect, onClose }) {
  return (
    <div
      className={`text-card ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <span className="card-title">{text.title}</span>
        <button
          className="close-btn"
          onClick={e => { e.stopPropagation(); onClose() }}
        >✕</button>
      </div>
      <div className="card-content">
        {text.content.length === 0
          ? <span className="empty-hint">פה עוד אין טקסט...</span>
          : text.content.map((item, i) => (
              <span key={i} style={item.style}>{item.char}</span>
            ))
        }
      </div>
    </div>
  )
}
