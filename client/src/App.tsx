import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from './context/AuthContext'

import Home from './components/Home'
import Editor from './components/editor/Editor'

function App() {
  return (
    <AuthContextProvider>
      <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/room/:roomId' element = {<Editor/>}/>
    </Routes>
    </AuthContextProvider>
    
  )
}

export default App