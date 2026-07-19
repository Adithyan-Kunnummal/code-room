import { useState } from 'react'
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { UserAuth } from '../context/AuthContext'

export default function Home() {
    const [roomId, setRoomId] = useState('')
    
    let navigate = useNavigate();

    const { session, user, handleLogin, handleLogout, loading } = UserAuth()

    return (
        <div>
            <form>
                <button onClick={(e) => {
                    e.preventDefault()
                    handleLogin()}}>Sign in with google</button>

            </form>
            <form 
            onSubmit={(e) => {
                e.preventDefault()
                navigate(`/editor/${roomId}`);
            }}
            className="flex flex-col text-white gap-4 justify-center items-center h-dvh"
        >
            <span className="font-bold text-xl text-slate-200">Code Room</span>
            <input
                onChange={(e) => {setRoomId(e.target.value)}}
                type="text"
                placeholder="Enter room ID..."
                className="bg-cyan-950 w-70 h-10 p-2 rounded border-1 border-slate-500"
            />
            <Link
            to={`/editor/${roomId}`}
            className="flex bg-cyan-950 text-center w-30 h-8 rounded items-center justify-center hover:bg-cyan-900 transition">
                Join Room
            </Link>
        </form>
        </div>
        
            
    )
}