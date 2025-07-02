import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import CalendarPage from "./pages/CalendarPage";
import DreamPage    from "./pages/DreamPage";
import Layout       from "./components/Layout"; 
import AddDreamPage from "./pages/AddDreamPage";



function App() {
  return(
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<CalendarPage />} />
        <Route path='dreams/:id' element={<DreamPage />} />
        <Route path="/dreams/new" element={<AddDreamPage />} />
      </Route>
    </Routes>
  );
}


export default App;
