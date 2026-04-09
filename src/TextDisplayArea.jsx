import TextCard from './TextCard'

export default function TextDisplayArea({ texts, activeId, onSelect, onClose }) {
  return (
    <div className="display-area">
      {texts.map(text => (
        <TextCard
          key={text.id}
          text={text}
          isActive={text.id === activeId}
          onSelect={() => onSelect(text.id)}
          onClose={() => onClose(text.id)}
        />
      ))}
    </div>
  )
}
