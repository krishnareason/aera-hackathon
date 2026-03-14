import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

export default function Layout({ children }) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate(); 
  const location = useLocation(); 

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🛠️ The Logout Function for the Blue Circle
  const handleLogout = () => {
    // In a real app, you'd clear the auth token here. For the demo, just send them to login!
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-gray-900 font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-20 bg-[#0B0F19] border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-[5000] relative shadow-2xl">
        <div 
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)] cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-white font-black text-xl tracking-tighter">AE</span>
        </div>

        <div className="flex flex-col gap-6 w-full mt-4 items-center">
          
          {/* Dashboard Tab */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="relative group w-full flex justify-center cursor-pointer"
            title="Map Engine"
          >
            {location.pathname === '/dashboard' && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full"></div>}
            <div className={`p-3 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
          </button>
          
          {/* 🛠️ Impact Vault Tab */}
          <button 
            onClick={() => navigate('/vault')}
            className="relative group w-full flex justify-center cursor-pointer"
            title="Impact Vault"
          >
            {location.pathname === '/vault' && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full"></div>}
            <div className={`p-3 rounded-xl transition-all ${location.pathname === '/vault' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </button>

          {/* Settings Tab (Still locked for demo) */}
          <button 
            onClick={() => navigate('/settings')}
            className="relative group w-full flex justify-center cursor-pointer"
            title="Settings"
          >
            {/* Add the blue indicator line if active */}
            {location.pathname === '/settings' && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full"></div>}
            
            <div className={`p-3 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 w-full h-16 bg-white/70 backdrop-blur-xl border-b border-gray-200 z-[4000] flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-600 tracking-widest uppercase">
              AERA Neural Routing Engine: <span className="text-emerald-600">ONLINE</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-sm font-mono font-bold text-gray-500 bg-gray-100/80 px-4 py-1.5 rounded-lg border border-gray-200 shadow-inner">
              {time.toLocaleTimeString()}
            </div>
            
            {/* 🛠️ PROFILE AVATAR / LOGOUT BUTTON */}
            <div 
              onClick={handleLogout}
              title="Click to Logout"
              className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group"
            >
              <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Out</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}