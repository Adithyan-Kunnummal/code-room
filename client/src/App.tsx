import {javascript} from "@codemirror/lang-javascript"
import {EditorView, basicSetup} from "codemirror"
import {useState, useRef, useEffect} from 'react'
import {oneDark} from "@codemirror/theme-one-dark"
import axios from 'axios'

function App() {
  const editorRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const editorView = useRef<EditorView | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if(editorRef.current == null) return

    const view = new EditorView({
      doc: "Start document",
      parent: editorRef.current,
      extensions: [
        basicSetup,
        javascript({typescript: true}),
        oneDark
      ]
    })

    editorView.current = view

    return () => view.destroy();
    }, [])

  async function handleExecute() {
    const data = {
      "language": "javascript",
      "version": "20.11.1",
      "files": [
          {
              "content": editorView.current?.state.doc.toString()
          }
      ],
  }
  try {
    setIsRunning(true)

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/execute`, data)
    if(outputRef.current) outputRef.current.textContent = response.data
  } catch(error) {
    console.log(error)
  } finally {
    setIsRunning(false)
  }
  }

return (
  <div>
    <button onClick={handleExecute} className="w-20 h-8 text-white text-sm bg-cyan-950 rounded-sm m-2">{isRunning? "Running..." : "Run"}</button>
    <div className="flex">
      <div className=" h-[80vh] w-[50vw] bg-[#0c121d] overflow-auto" ref={editorRef}></div>
      <div ref={outputRef} className="h-[80vh] w-[50vw] font-serif text-white text-sm bg-[#0c121d] overflow-auto p-1"></div>
    </div>
  </div>
)

}

export default App
