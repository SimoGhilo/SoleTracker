//Dependecies
import { Routes, Route } from "react-router-dom";
//Components
import Login from "./Login";
import Register from "./Register";

function App() {

  /**TODO: Do dashboard*/

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </>
  )
}

export default App
