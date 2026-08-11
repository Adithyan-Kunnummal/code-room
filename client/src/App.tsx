import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from './context/AuthContext'

import Home from './components/Home'
import Editor from './components/editor/Editor'
import Chat from './components/chat/ChatPage'

function App() {
  return (
    <AuthContextProvider>
      <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/room/:roomId' element = {<Editor/>}/>
      <Route path = '/chat' element = {<Chat/>}/>
    </Routes>
    </AuthContextProvider>
    
  )
}

export default App