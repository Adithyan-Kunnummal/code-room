import { useState, useEffect } from 'react'
import { useNavigate } from "react-router";
import { UserAuth } from '../context/AuthContext'
import {supabase} from "../lib/supabase"

export default function Home() {
    const [roomId, setRoomId] = useState('')
    const [username, setUsername] = useState("Anonymous")
    
    let navigate = useNavigate();

    const { session, user, handleLogin, handleLogout } = UserAuth()

    useEffect(() => {
        setUsername(user?.user_metadata.name)
    }, [session, user]) 

    async function joinRoom() {
        if (!roomId.trim()) return;

            const {data, error} = await supabase
                .rpc('join_room', {
                    input_room_id: roomId
                })
                
                if(error) {
                    console.log("ERROR: ", error.message)
                    return
                }
                if(!data) {
                    console.log("No room found with ID: ", roomId)
                    return
                }

            navigate(`/room/${roomId.trim()}`);
    };

    async function createRoom() {
        const {data: id, error} = await supabase.rpc('create_room')

        if(error) {
            console.log(error)
            return  
        }

        navigate(`/room/${id}`)
    }

    return (
         <div className="min-h-screen bg-[#2E392F] text-white flex items-center justify-center">

            <div className="
                w-full max-w-md
                bg-[#30312F]
                rounded-2xl
                p-8
                shadow-xl
                border border-[#40513B]
            ">

                <div className="text-center mb-8">
                    <h1 className="
                        text-4xl 
                        font-bold
                        tracking-wide
                    ">
                        CodeRoom
                    </h1>

                    <p className="
                        mt-2
                        text-[#8A9B8C]
                    ">
                        Real-time collaborative coding
                    </p>
                </div>


                <div className="
                    bg-[#40513B]
                    rounded-xl
                    p-4
                    mb-6
                    flex
                    items-center
                    justify-between
                ">

                    <div>
                        <p className="text-sm text-[#8A9B8C]">
                            Current user
                        </p>
                        
                        {!username ?
                        <div className = 'h-[20px]'>
                            <img className = 'w-12 object-cover h-[100%]' src = './spinner.svg'/> 
                        </div>
                        :
                        <p className="font-semibold">
                            {username}
                        </p>
                        }
                        
                    </div>
                    {!user?.is_anonymous }

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


                <div className="space-y-4">


                    <input
                        value={roomId}
                        onChange={(e)=>setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        className="
                            w-full
                            bg-[#2E392F]
                            border
                            border-[#40513B]
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            placeholder:text-[#8A9B8C]
                            focus:border-[#8A9B8C]
                        "
                    />


                    <button
                        onClick={joinRoom}
                        className="
                            w-full
                            bg-[#40513B]
                            py-3
                            rounded-xl
                            font-semibold
                            hover:bg-[#526848]
                            transition
                        "
                    >
                        Join Room
                    </button>


                    <div className="
                        flex
                        items-center
                        gap-3
                        text-[#8A9B8C]
                    ">
                        <div className="h-px bg-[#40513B] flex-1"/>
                        OR
                        <div className="h-px bg-[#40513B] flex-1"/>
                    </div>


                    <button
                        onClick={createRoom}
                        className="
                            w-full
                            border
                            border-[#8A9B8C]
                            text-[#8A9B8C]
                            py-3
                            rounded-xl
                            font-semibold
                            hover:bg-[#40513B]
                            hover:text-white
                            transition
                        "
                    >
                        Create New Room
                    </button>

                </div>

            </div>

        </div>
        
            
    )
}