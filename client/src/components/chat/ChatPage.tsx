import { RealtimeChat } from './RealtimeChat'
import { UserAuth } from '../../context/AuthContext'

type ChatPageProps = {
    roomID: string
}

export default function ChatPage({roomID} : ChatPageProps) {
    const { user } = UserAuth()
    return <RealtimeChat roomName={roomID} username={user?.user_metadata.name} />
}
