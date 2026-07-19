import * as Y from 'yjs'
import { yCollab } from 'y-codemirror.next'
import { WebrtcProvider } from 'y-webrtc'

import * as random from 'lib0/random'

import {javascript} from "@codemirror/lang-javascript"
import {EditorState} from "@codemirror/state";
import {EditorView, basicSetup} from "codemirror"
import {oneDark} from "@codemirror/theme-one-dark"

import {useState, useRef, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import axios from 'axios'

export default function Editor() {
    const editorRef = useRef<HTMLDivElement>(null)
    const editorView = useRef<EditorView | null>(null)

    const { roomId } =  useParams()

    const [isRunning, setIsRunning] = useState(false)
    const [output, setOutput] = useState('')
    const [users, setUsers] = useState<string[]>([])

    const usercolors = [
    { color: '#30bced', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' }
    ]

    const userColor = usercolors[random.uint32() % usercolors.length]

    useEffect(() => {
        if(editorRef.current == null || roomId == null) return

        const ydoc = new Y.Doc()
        const provider = new WebrtcProvider(roomId, ydoc)
        const ytext = ydoc.getText('codemirror')

        const undoManager = new Y.UndoManager(ytext)

        provider.awareness.setLocalStateField('user', {
        name: 'Anonymous ' + Math.floor(Math.random() * 100),
        color: userColor.color,
        colorLight: userColor.light
    })


    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        yCollab(ytext, provider.awareness, { undoManager })
      ]
    })

    const view = new EditorView({ state, parent: editorRef.current})
    editorView.current = view

    function updateUsers() {
        const currUsers = Array.from(provider.awareness.getStates().values())
        .filter((state) => state.user)
        .map(state => state.user.name)
        setUsers(currUsers)
    }

    updateUsers()
    provider.awareness.on('change', () => updateUsers())

    return () => {
      view.destroy()
      provider.destroy();
      ydoc.destroy();
    };
    }, [roomId])

    const currUsersElements = users.map((user) => (<li key = {user}>{user}</li>))

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
            setOutput(response.data)
        }
        catch(error) {
            setOutput("Execution Failed")
            console.log(error)
        } 
        finally {
            setIsRunning(false)
        }
    }

    return (
    <div>
        <button 
        disabled={isRunning}
        onClick={handleExecute}
        className="w-20 h-8 text-white text-sm bg-cyan-950 rounded-sm m-2">
        {isRunning? "Running..." : "Run"}
        </button>
        <div className="flex">
        <div className="flex items-center flex-col">
            <span className="w-12 text-white text-center text-sm">Editor</span>
            <div className=" h-[80vh] w-[50vw] bg-[#0c121d] overflow-auto" ref={editorRef}></div>
        </div>
        <div className="flex items-center flex-col">
            <span className="text-white text-center text-sm">Output</span>
            <div className="h-[80vh] w-[50vw] font-serif text-white text-xs bg-[#0c121d] overflow-auto p-1">{output}</div>
        </div>
        </div>
        <div className="text-white">{currUsersElements}</div>
    </div>
    )
}