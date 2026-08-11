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

import {UserAuth} from '../../context/AuthContext'
import {supabase} from "../../lib/supabase"
import {startTimer, stopTimer} from '../../utils/timer'

import EditorHeader from './EditorHeader'
import EditorFooter from './EditorFooter'

import {
    Pencil,
    X,
} from 'lucide-react'

export default function Editor() {
    // Ref to div that editor should atttach to
    const editorRef = useRef<HTMLDivElement>(null)
    // Reference to editorView so that component survives re-renders
    const editorView = useRef<EditorView | null>(null) 
    // Refernce to ydoc so that it survives re-renders
    const yDocRef =  useRef<Y.Doc | null>(null)
    // Create webrtc provider once
    const providerRef = useRef<WebrtcProvider | null>(null);
    // To get access to text in editor for saving to db
    const yTextRef = useRef<Y.Text | null>(null)

    const { roomId } = useParams()

    const [isRunning, setIsRunning] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [output, setOutput] = useState('')
    const [isIdCopied, setIsIdCopied] = useState(false)
    const [showRenameModal, setShowRenameModal] = useState(false)
    const [fileName, setFileName] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [users, setUsers] = useState<string[]>([])

    const { user, setLoading } = UserAuth()

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
    function setupEditor(roomId: string, parent: HTMLDivElement) {
        const ydoc = new Y.Doc()
        const provider = new WebrtcProvider(roomId, ydoc, {
            signaling: [
                "ws://localhost:4444"
            ]
        })
        const ytext = ydoc.getText('codemirror')

        const undoManager = new Y.UndoManager(ytext)

        yDocRef.current = ydoc
        providerRef.current = provider
        yTextRef.current = ytext

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
        const view = new EditorView({ state, parent: parent})
        editorView.current = view

        return {
            ydoc,
            provider,
            ytext,
            view
        }
    }

    // Load from db if no content exists in ydoc
    async function loadInitialContent() {
        const fileContent = yTextRef.current?.toString()

        const { data, error } = await supabase
            .from('rooms')
            .select('file_name')
            .eq('room_id', roomId)
            .single()
        
        if(error) {
            console.log(error)
        }
        setFileName(data?.file_name)
        setNewFileName(data?.file_name)

        if(!fileContent) {
            const { data, error } = await supabase
                .from('rooms')
                .select('file_content')
                .eq('room_id', roomId)
                .single()

            if(error) {
                console.log(error)
            }
            yTextRef.current?.insert(0, data?.file_content)
        }
    }

    // Update list of users
    function updateUsers(provider: WebrtcProvider) {
        const currUsers = Array.from(provider.awareness.getStates().values())
        .filter((state) => state.user)
        .map(state => state.user.name)
        setUsers(currUsers)
        return currUsers
    }

    // Save doc every 10 seconds of inactivity
    function autoSaveObserver() {
        stopTimer()
        startTimer(10000, handleSave)
    }

    useEffect(() => {
        if(!editorRef.current || !roomId) return

        const { ydoc, provider, ytext, view } = setupEditor(roomId, editorRef.current)

        // Update list of users when user joins or leaves
        provider.awareness.on('change',
            () => updateUsers(provider))
        
        // Only runs when 2 users are synced
        provider.on('synced',
            () => loadInitialContent())

        setLoading(true)
        // For first user. Wait before fetching since it takes time to setup ydoc
        setTimeout(() => {
            loadInitialContent()
            setLoading(false)
        }, 2000)

        ytext.observe(autoSaveObserver)

        return () => {
            view.destroy()
            provider.destroy()
            ydoc.destroy()
            ytext.unobserve(autoSaveObserver)
            stopTimer()
        };
    }, [roomId])

    // Setting names and cursor color for users
    useEffect(() => {
        if (!providerRef.current || !user) return

        providerRef.current.awareness.setLocalStateField("user", {
            name: user.user_metadata.name,
            color: userColor.color,
            colorLight: userColor.light,
        })
    }, [user])

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

    // Save to database
    async function handleSave() {
        if(!yTextRef.current?.toString()) return
        setIsSaving(true)

        const { error } = await supabase
            .from("rooms")
            .update({ file_content: yTextRef.current?.toString() })
            .eq("room_id", roomId)

        setIsSaving(false)

        if(error) console.log(error)
    }

    // Copy room ID to clipboard
    async function handleCopyId() {
        try {
            await navigator.clipboard.writeText(roomId ?? "")
            setIsIdCopied(true)
            setTimeout(() => {
                setIsIdCopied(false)
            }, 1000)
        } catch (error) {
            console.error("Failed to copy room ID.", error)
        }
    }

    // Rename room file
    async function handleRenameFile() {
        if(!newFileName) return

        const { error } = await supabase
            .from('rooms')
            .update({ file_name: newFileName })
            .eq('room_id', roomId)

        if(error) console.log(error)
        else setFileName(newFileName)

        setShowRenameModal(false)
    }

    // Download file
    async function handleDownloadFile() {
        const data = yTextRef.current?.toString()
        if(!data) return

        const blob = new Blob([data], {type: 'text/plain'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = fileName
        link.click()
        
        URL.revokeObjectURL(url)
    }

    return (
    <div className="min-h-screen bg-[#40513B] text-white flex flex-col">

    <EditorHeader 
        roomId={roomId}
        handleCopyId={handleCopyId}
        handleDownloadFile={handleDownloadFile}
        handleSave={handleSave}
        handleExecute={handleExecute}
        isIdCopied={isIdCopied}
        isSaving={isSaving}
        isRunning={isRunning}/>

    <main className="flex flex-1 overflow-hidden">

        <div className="
            w-10
            bg-[#30312F]
            flex
            flex-col
        ">

        </div>


        <section className="bg-[#30312F] flex-1 flex flex-col">

            <div className="
                h-10
                px-4
                border-b
                border-l
                border-[#40513B]
                flex
                items-center
                bg-[#30312F]
            ">
                <div className="flex gap-2 items-center">
                    <span className="text-[#8A9B8C]">
                        {fileName + ".js"}
                    </span>
                    <button
                    onClick = {() => {setShowRenameModal(true)}}
                    className="hover:cursor-pointer">
                        <Pencil size={18} color="#8A9B8C"/>
                    </button>
                </div>
                

            </div>

            <div
            ref={editorRef}
            className="
                flex-1
                overflow-auto
                border-l
                border-[#40513B]
            ">
            </div>

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

        {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-md rounded-xl bg-[#30312F] shadow-xl">
                <div className="relative border-b border-gray-700 p-4">
                    <h2 className="text-center text-lg">
                        Rename File
                    </h2>

                    <button
                        onClick={()=> {setShowRenameModal(false)}}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-[#40513B] transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                    <input
                        type="text"
                        className="w-full rounded bg-[#2E392F] px-4 py-3 outline-none focus:ring-1 focus:ring-[#8A9B8C]"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                        <button
                        onClick={handleRenameFile}
                        className="rounded bg-[#40513B] px-4 py-2 hover:bg-[#526848]">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>)
        }
    </main>

        <EditorFooter users={users} />
    
</div>
    )
}