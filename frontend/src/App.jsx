import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; 
import ImpactVault from './components/ImpactVault';
import Settings from './components/Settings';
import History from './components/History'; // 🛠️ History Imported

function AppContent() {
  const location = useLocation();
  
  // 🛠️ Checks all internal paths to hide the public Navbar
  const isInternalApp = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/vault') || 
    location.pathname.startsWith('/history') ||
    location.pathname.startsWith('/settings');

  return (
    <div className="w-full min-h-screen font-sans text-gray-900 flex flex-col">
      
      {!isInternalApp && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes (Wrapped in the Sidebar Layout) */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} 
        />
        
        {/* 🛠️ HERE IS YOUR VAULT ROUTE RESTORED */}
        <Route 
          path="/vault" 
          element={<ProtectedRoute><Layout><ImpactVault /></Layout></ProtectedRoute>} 
        />
        
        {/* 🛠️ THE NEW HISTORY ROUTE */}
        <Route 
          path="/history" 
          element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} 
        />

        <Route 
          path="/settings" 
          element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;