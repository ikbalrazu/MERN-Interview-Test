import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Whiteboard from './components/Whiteboard'
import WhiteBoard2 from './components/WhiteBoard2'
import Library from './components/Library'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Library/>} />
        <Route path='/drawing/:id' element={<WhiteBoard2/>} />
        {/* <Route path='/newdrawing' element={<NewDrawing/>} /> */}
        <Route path='*' element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </Router>
  )
}

export default App
