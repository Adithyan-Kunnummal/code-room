import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../../context/AuthContext'

import {
    Copy,
    CopyCheck,
    Download,
    Save,
    Play
} from 'lucide-react'

interface EditorHeaderProps {
    roomId: string | undefined,
    handleCopyId: () => Promise<void>,
    handleDownloadFile: () => Promise<void>,
    handleSave: () => Promise<void>,
    handleExecute: () => Promise<void>,
    isIdCopied: boolean,
    isSaving: boolean,
    isRunning: boolean
}

export default function EditorHeader({ roomId, handleCopyId, handleDownloadFile, handleSave, handleExecute, isIdCopied, isSaving, isRunning }: EditorHeaderProps) {
    const { user } = UserAuth()
    const navigate = useNavigate()

    return (
        <header className="h-20 px-6 border-b border-[#40513B] bg-[#30312F] flex items-center justify-between">

            <div>
                <h1 onClick={() => navigate('/')} className="text-xl font-bold cursor-pointer">
                    CodeRoom
                </h1>

                <div className="flex gap-2 items-center text-sm">
                    <p className="text-sm text-[#8A9B8C]">
                        Room ID: {roomId}
                    </p>
                    <button
                        className="hover:cursor-pointer"
                        onClick={handleCopyId}
                    >
                        {isIdCopied ? <CopyCheck size={18} /> : <Copy size={18} color="#8A9B8C" />}
                    </button>
                </div>

            </div>

            <div className="flex items-center gap-4">

                <div className="flex gap-2">
                    <div className="text-right">
                        <p className="text-sm text-[#8A9B8C]">
                            Signed in as
                        </p>

                        <p className="font-semibold">
                            {user?.user_metadata.name}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadFile}
                    className="flex gap-2 items-center justify-center bg-[#40513B] px-3 py-2 rounded-lg hover:bg-[#4f6348]"
                >
                    <Download size={18} />
                    Download
                </button>

                <button
                    onClick={handleSave}
                    className="flex gap-1 items-center justify-center bg-[#40513B] px-3 py-2 rounded-lg hover:bg-[#4f6348]"
                >
                    <Save size={18} />
                    {!isSaving ? "Save" : "Saving..."}
                </button>

                <button
                    onClick={handleExecute}
                    disabled={isRunning}
                    className="flex gap-1 items-center justify-center bg-[#40513B] px-3 py-2 rounded-lg hover:bg-[#4f6348] disabled:opacity-50"
                >
                    <Play size={18} />
                    {isRunning ? "Running..." : "Run"}
                </button>

            </div>

        </header>
    )
}