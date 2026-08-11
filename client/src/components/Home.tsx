import { useState, useEffect } from 'react'
import { useNavigate } from "react-router"
import { UserAuth } from '../context/AuthContext'
import { supabase } from "../lib/supabase"

export default function Home() {
    const [roomId, setRoomId] = useState('')
    const [username, setUsername] = useState("")
    const [prevRooms, setPrevRooms] = useState<string[]>([])
    const [isJoining, setIsJoining] = useState(false)

    const navigate = useNavigate()

    const { session, user, handleLogin, handleLogout } = UserAuth()

    useEffect(() => {
        if (!session?.user) return
        setUsername(session.user.user_metadata.name)
    }, [session])

    async function joinRoom(idToJoin: string) {
        const trimmedId = idToJoin.trim()
        if (!trimmedId || isJoining) return

        setIsJoining(true)

        try {
            const { data, error } = await supabase
                .rpc('join_room', { input_room_id: trimmedId })

            if (error) {
                console.log("ERROR: ", error.message)
                return
            }
            if (!data) {
                console.log("No room found with ID: ", trimmedId)
                return
            }

            navigate(`/room/${trimmedId}`)
        } finally {
            setIsJoining(false)
        }
    }

    async function createRoom() {
        const { data: id, error } = await supabase.rpc('create_room')

        if (error) {
            console.log(error)
            return
        }

        navigate(`/room/${id}`)
    }

    async function fetchPrevRooms() {
        const { data, error } = await supabase
            .from('rooms')
            .select('room_id')

        if (error) {
            console.log(error)
            return
        }

        return data
    }

    useEffect(() => {
        if (!user) return

        async function loadRooms() {
            const rooms = await fetchPrevRooms()
            if (rooms) setPrevRooms(rooms.map((obj) => obj.room_id))
        }

        loadRooms()
    }, [user])

    function handleRoomIdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') joinRoom(roomId)
    }

    return (
        <div className="min-h-screen bg-[#2E392F] text-white flex items-center justify-center">

            <div className="w-full max-w-md bg-[#30312F] rounded-2xl p-8 shadow-xl border border-[#40513B]">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-wide">
                        CodeRoom
                    </h1>

                    <p className="mt-2 text-[#8A9B8C]">
                        Real-time collaborative coding
                    </p>
                </div>

                <div className="bg-[#40513B] rounded-xl p-4 mb-6 flex items-center justify-between">

                    <div>
                        <p className="text-sm text-[#8A9B8C]">
                            Current user
                        </p>

                        {!username ? (
                            <div className="h-[20px]">
                                <img className="w-12 object-cover h-full" src="/spinner.svg" alt="loading" />
                            </div>
                        ) : (
                            <p className="font-semibold">
                                {username}
                            </p>
                        )}
                    </div>

                    {user?.is_anonymous ? (
                        <button
                            onClick={handleLogin}
                            className="bg-white text-[#30312F] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            Signin with Google
                        </button>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="bg-white text-[#30312F] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            Signout
                        </button>
                    )}

                </div>

                <div className="space-y-4">

                    <input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyDown={handleRoomIdKeyDown}
                        placeholder="Enter room ID"
                        className="w-full bg-[#2E392F] border border-[#40513B] rounded-xl px-4 py-3 outline-none placeholder:text-[#8A9B8C] focus:border-[#8A9B8C]"
                    />

                    <button
                        onClick={() => joinRoom(roomId)}
                        disabled={isJoining}
                        className="w-full bg-[#40513B] py-3 rounded-xl font-semibold hover:bg-[#526848] transition disabled:opacity-50"
                    >
                        {isJoining ? "Joining..." : "Join Room"}
                    </button>

                    {prevRooms.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-[#8A9B8C]">
                                <div className="h-px bg-[#40513B] flex-1" />
                                OR
                                <div className="h-px bg-[#40513B] flex-1" />
                            </div>

                            <select
                                onChange={(e) => joinRoom(e.target.value)}
                                defaultValue="selectHeading"
                                className="w-full appearance-none bg-[#40513B] px-4 py-3 rounded-xl cursor-pointer outline-none transition-all hover:bg-[#4A5E43] text-center font-semibold"
                            >
                                <option value="selectHeading" disabled>Join Previous Room</option>
                                {prevRooms.map((id) => (
                                    <option value={id} key={id}>{id}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-[#8A9B8C]">
                        <div className="h-px bg-[#40513B] flex-1" />
                        OR
                        <div className="h-px bg-[#40513B] flex-1" />
                    </div>

                    <button
                        onClick={createRoom}
                        className="w-full border border-[#8A9B8C] text-[#8A9B8C] py-3 rounded-xl font-semibold hover:bg-[#40513B] hover:text-white transition"
                    >
                        Create New Room
                    </button>

                </div>

            </div>

        </div>
    )
}