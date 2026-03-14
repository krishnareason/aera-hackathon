import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // 🛠️ Imported the new Command Shell
import ImpactVault from './components/ImpactVault';
import Settings from './components/Settings';

// 🛠️ We create a helper component so we can use the 'useLocation' hook
function AppContent() {
  const location = useLocation();
  
  // Check if we are on the dashboard or any future internal pages
  const isInternalApp = location.pathname.startsWith('/dashboard');

  return (
    <div className="w-full min-h-screen font-sans text-gray-900 flex flex-col">
      
      {/* 🛠️ Only show the basic Navbar on Landing, Login, and Register */}
      {!isInternalApp && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {/* 🛠️ Wrap ONLY the Dashboard in the new Layout Shell */}
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
            path="/vault" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ImpactVault />
                </Layout>
              </ProtectedRoute>
            } 
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