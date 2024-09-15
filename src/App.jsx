import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Whiteboard from './components/Whiteboard';
import Library from './components/Library';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewDrawing from "./components/NewDrawing";

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Library/>} />
        <Route path='/drawing/:id' element={<Whiteboard/>} />
        <Route path='/newdrawing' element={<NewDrawing/>} />
        <Route path='*' element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </Router>
  )
}

export default App
