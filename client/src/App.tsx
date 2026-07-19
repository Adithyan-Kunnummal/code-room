import { Routes, Route } from "react-router";
import { AuthContextProvider } from './context/AuthContext'

import Home from './components/Home'
import Editor from './components/Editor'

function App() {
  return (
    <AuthContextProvider>
      <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/editor/:roomId' element = {<Editor/>}/>
    </Routes>
    </AuthContextProvider>
    
  )
}

export default App