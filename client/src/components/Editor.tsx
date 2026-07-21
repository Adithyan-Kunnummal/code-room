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

import {UserAuth} from '../context/AuthContext'

export default function Editor() {
    // Ref to div that editor should atttach to
    const editorRef = useRef<HTMLDivElement>(null)
    // Reference to editorView so that component survives re-renders
    const editorView = useRef<EditorView | null>(null) 

    const { roomId } =  useParams()

    const [isRunning, setIsRunning] = useState(false)
    const [output, setOutput] = useState('')
    const [users, setUsers] = useState<string[]>([])

    const { session, user, handleLogin, handleLogout } = UserAuth()

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

    // Setup Yjs doc and Codemirror editor
    useEffect(() => {
        if(editorRef.current == null || roomId == null || session == null) return

        const ydoc = new Y.Doc()
        const provider = new WebrtcProvider(roomId, ydoc)
        const ytext = ydoc.getText('codemirror')

        const undoManager = new Y.UndoManager(ytext)

        provider.awareness.setLocalStateField('user', {
        name: user?.user_metadata.name,
        color: userColor.color,
        colorLight: userColor.light
    })

    // State stores information about the editor
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        yCollab(ytext, provider.awareness, { undoManager })
      ]
    })

    // Editor UI
    const view = new EditorView({ state, parent: editorRef.current})
    editorView.current = view

    function updateUsers() {
        const currUsers = Array.from(provider.awareness.getStates().values())
        .filter((state) => state.user)
        .map(state => state.user.name)
        setUsers(currUsers)
    }

    // Update list of users when user joins or leaves
    updateUsers()
    provider.awareness.on('change', () => updateUsers())

    return () => {
        view.destroy()
        provider.destroy();
        ydoc.destroy();
    };
    }, [roomId, session])

    // Run code with piston
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
    <div className="min-h-screen bg-[#40513B] text-white flex flex-col">

    <header className="h-16 px-6 border-b border-[#40513B] bg-[#30312F] flex items-center justify-between">

        <div>
            <h1 className="text-xl font-bold">
                CodeRoom
            </h1>

            <p className="text-sm text-[#8A9B8C]">
                Room ID: {roomId}
            </p>
        </div>

        <div className="flex items-center gap-4">

            <div className="flex gap-2">
                <div className = "text-right">
                    <p className="text-sm text-[#8A9B8C]">
                        Signed in as
                    </p>
                    
                    <p className="font-semibold">
                        {user?.user_metadata.name}
                    </p>
                </div>
                <div>
                    {user?.is_anonymous ? <button
                        onClick={handleLogin}
                        className="
                            bg-white
                            text-[#30312F]
                            px-4
                            py-2
                            rounded-lg
                            font-medium
                            hover:opacity-90
                            transition
                        "
                    >
                        Signin with Google
                    </button> 
                    : 
                    <button
                        onClick={handleLogout}
                        className="
                            bg-white
                            text-[#30312F]
                            px-4
                            py-2
                            rounded-lg
                            font-medium
                            hover:opacity-90
                            transition
                        "
                    >
                        Signout
                    </button>}
                </div>
            </div>

            <button
                onClick={handleExecute}
                disabled={isRunning}
                className="
                    bg-[#40513B]
                    px-5
                    py-2
                    rounded-lg
                    hover:bg-[#4f6348]
                    disabled:opacity-50
                "
            >
                {isRunning ? "Running..." : "Run"}
            </button>

        </div>

    </header>

    <main className="flex flex-1 overflow-hidden">

        <div className="
            w-64
            border-r
            border-[#40513B]
            bg-[#30312F]
            flex
            flex-col
        ">

            <div className="p-2 border-b border-[#40513B]">

                <h2 className="font-semibold">
                    Files
                </h2>

            </div>

            <div className="flex-1 overflow-auto p-2">

                <button className="w-full text-left p-3 rounded-lg hover:bg-[#40513B]">
                    main.js
                </button>

            </div>

        </div>


        <section className="bg-[#30312F] flex-1 flex flex-col">

            <div className="
                h-10
                px-4
                border-b
                border-[#40513B]
                flex
                items-center
                bg-[#30312F]
            ">

                <span className="text-[#8A9B8C]">
                    main.js
                </span>

            </div>
            <div
                ref={editorRef}
                className="
                    flex-1
                    overflow-auto
                "
            />

        </section>


        <div className="
            w-[350px]
            border-l
            border-[#40513B]
            bg-[#30312F]
            flex
            flex-col
        ">

            <div className="
                h-10
                border-b
                border-[#40513B]
                flex
                items-center
                px-4
            ">
                Output
            </div>

            <div
                className="
                    flex-1
                    overflow-auto
                    p-4
                    text-sm
                    font-mono
                    whitespace-pre-wrap
                "
            >
                {output}
            </div>

        </div>

    </main>

    <footer className="
        h-14
        border-t
        border-[#40513B]
        bg-[#30312F]
        px-6
        flex
        items-center
        justify-between
    ">

        <div className="flex gap-2 flex-wrap">

            {users.map((u) => (
                <span
                    key={u}
                    className="
                        px-3
                        py-1
                        rounded-full
                        bg-[#40513B]
                        text-sm
                    "
                >
                    {u}
                </span>
            ))}

        </div>

        <span className="text-[#8A9B8C] text-sm">
            {users.length} online
        </span>

    </footer>

</div>
    )
}