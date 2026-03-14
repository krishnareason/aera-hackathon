import { useState, useEffect } from 'react';

export default function ImpactVault() {
  const [stats, setStats] = useState({
    lifeSaved: 0,
    toxicDodged: 0,
    routesTaken: 0,
    level: 1,
    transitTaken: 0
  });

  const [isTestUser, setIsTestUser] = useState(false);

  useEffect(() => {
    // Check who logged in
    const email = localStorage.getItem('userEmail') || '';
    
    if (email === 'test@aera.com') {
      setIsTestUser(true);
      setStats({
        lifeSaved: 142.5,
        toxicDodged: 84,
        routesTaken: 27,
        level: 12,
        transitTaken: 15
      });
    } else {
      // Load ACTUAL data from their browser memory
      const realLifeSaved = parseFloat(localStorage.getItem('aera_lifeSaved') || 0);
      const realToxicDodged = parseInt(localStorage.getItem('aera_toxicDodged') || 0);
      const realRoutes = parseInt(localStorage.getItem('aera_routesTaken') || 0);
      const realTransit = parseInt(localStorage.getItem('aera_transitTaken') || 0);
      
      const calcLevel = Math.floor(realRoutes / 3) + 1;

      setStats({
        lifeSaved: realLifeSaved.toFixed(1),
        toxicDodged: realToxicDodged,
        routesTaken: realRoutes,
        level: calcLevel,
        transitTaken: realTransit
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-8 pb-12 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Impact Vault</h1>
            {isTestUser ? (
              <p className="text-blue-500 font-bold mt-2 text-sm uppercase tracking-widest">★ DEMO ACCOUNT ACTIVE</p>
            ) : (
              <p className="text-gray-500 mt-2 text-lg">Your lifetime environmental and biological stats.</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Rank</p>
            <h2 className="text-3xl font-black text-blue-600">Level {stats.level} Eco-Driver</h2>
          </div>
        </div>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-8 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-transform">
            <div className="text-green-200 text-sm font-bold uppercase tracking-widest mb-2">Life Expectancy Restored</div>
            <div className="text-6xl font-black mb-2">+{stats.lifeSaved}</div>
            <div className="text-green-100 font-medium">Minutes of life saved from toxic exposure</div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-transform">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Toxic Corridors Bypassed</div>
            <div className="text-6xl font-black text-yellow-400 mb-2">{stats.toxicDodged}</div>
            <div className="text-gray-300 font-medium">High-PM2.5 intersections successfully avoided</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-8 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-transform">
            <div className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Clean Routes Taken</div>
            <div className="text-6xl font-black mb-2">{stats.routesTaken}</div>
            <div className="text-blue-100 font-medium">Total trips optimizing for biological safety</div>
          </div>
        </div>

        {/* BADGES */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Earned Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className={`border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all ${stats.lifeSaved >= 10 ? 'bg-white border-blue-200' : 'bg-gray-100 opacity-50 grayscale'}`}>
            <div className="text-5xl mb-4">🫁</div>
            <h4 className="font-bold text-gray-900">Iron Lungs</h4>
            <p className="text-xs text-gray-500 mt-2">{stats.lifeSaved >= 10 ? "Saved 10+ minutes of life expectancy." : "Save 10 minutes to unlock."}</p>
          </div>

          <div className={`border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all ${stats.transitTaken >= 1 ? 'bg-white border-blue-200' : 'bg-gray-100 opacity-50 grayscale'}`}>
            <div className="text-5xl mb-4">🚇</div>
            <h4 className="font-bold text-gray-900">Transit Hero</h4>
            <p className="text-xs text-gray-500 mt-2">{stats.transitTaken >= 1 ? "Committed to public transit!" : "Take public transit to unlock."}</p>
          </div>

          <div className={`border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all ${stats.toxicDodged >= 1 ? 'bg-white border-blue-200' : 'bg-gray-100 opacity-50 grayscale'}`}>
            <div className="text-5xl mb-4">☣️</div>
            <h4 className="font-bold text-gray-900">Hazard Dodger</h4>
            <p className="text-xs text-gray-500 mt-2">{stats.toxicDodged >= 1 ? "Successfully avoided a toxic zone." : "Avoid a high-traffic/dump zone to unlock."}</p>
          </div>

        </div>
      </div>
    </div>
  );
}