import { useState } from 'react'
import TextDisplayArea from './TextDisplayArea'
import EditorPanel from './EditorPanel'
import Toolbar from './Toolbar'

function createText(id) {
  return { id, title: `טקסט ${id}`, content: [] }
}

export default function App() {
  const [texts, setTexts] = useState([createText(1)])
  const [activeId, setActiveId] = useState(1)
  const [nextId, setNextId] = useState(2)

  function addText() {
    setTexts(prev => [...prev, createText(nextId)])
    setActiveId(nextId)
    setNextId(n => n + 1)
  }

  function removeText(id) {
    const remaining = texts.filter(t => t.id !== id)
    setTexts(remaining)
    if (activeId === id && remaining.length > 0)
      setActiveId(remaining[0].id)
  }

  function addChar(char, style) {
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: [...t.content, { char, style }]
      }
    ))
  }

  function deleteChar() {
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : {
        ...t, content: t.content.slice(0, -1)
      }
    ))
  }

  function clearText() {
    setTexts(prev => prev.map(t =>
      t.id !== activeId ? t : { ...t, content: [] }
    ))
  }

  return (
    <div className="app">
      <Toolbar onNew={addText} texts={texts} activeId={activeId} setTexts={setTexts} />
      <TextDisplayArea
        texts={texts}
        activeId={activeId}
        onSelect={setActiveId}
        onClose={removeText}
      />
      <EditorPanel
        onAddChar={addChar}
        onDelete={deleteChar}
        onClear={clearText}
      />
    </div>
  )
}
