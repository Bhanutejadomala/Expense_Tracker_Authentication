import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LoginSignup from "./LoginSignup"
import ExpenseTracker from './ExpenseTracker';
function App() {
  
  return (
    <div>
    
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginSignup/>}/>
        <Route path='/expense' element={<ExpenseTracker/>}/>
      </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
