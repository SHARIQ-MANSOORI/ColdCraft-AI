import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {useAuth} from './context/AuthContext'
import  LandingPage from './pages/LandingPage'
import VerifyOtp from './pages/VerifyOtp';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App(){
  const {user , loading } = useAuth();

  if(loading) {
    return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 font-medium">Loading ColdCraft AI...</p>
          </div>
    )
  }
  return (
    <Router>
      <Toaster position="top-right"/>
           <Routes>
            <Route path="/" element = {<LandingPage/>}/>
            <Route path='/login' element = {!user ? <Login/> : <Navigate to="/dashboard"/>} />
            <Route path='/signup' element={!user ? <Signup/> : <Navigate to="/dashboard"/>}/>
            <Route path='/verify-otp' element={!user ? <VerifyOtp/> : <Navigate to="/dashboard"/>}/>
            
            {/* Authenticated routes wrapped in Layout */}
            <Route element={user ? <Layout /> : <Navigate to="/login" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
           </Routes>
    </Router>
  )
}

export default App