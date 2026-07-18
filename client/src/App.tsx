import { Routes, Route } from "react-router";

import Home from './components/Home'
import Editor from './components/Editor'

function App() {
  return (
    <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/editor/:roomId' element = {<Editor/>}/>
    </Routes>
  )
}

export default App