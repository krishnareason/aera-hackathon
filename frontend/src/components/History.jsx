import { useState, useEffect } from 'react';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load the saved trips from local storage
    const savedHistory = JSON.parse(localStorage.getItem('aera_tripHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your commute history?")) {
      localStorage.removeItem('aera_tripHistory');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-8 pb-12 flex flex-col items-center">
      <div className="w-full max-w-[1000px]">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Commute Ledger</h1>
            <p className="text-gray-500 mt-2 text-lg">A chronological log of your environmental exposure.</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <div className="text-6xl mb-4 opacity-50">🧭</div>
            <h3 className="text-xl font-bold text-gray-900">No trips logged yet</h3>
            <p className="text-gray-500 mt-2">Generate a route and click "Open in Google Maps" to log your first trip.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((trip) => (
              <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 transition-transform hover:scale-[1.01]">
                
                {/* Time & Location Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{trip.date} • {trip.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${trip.isFastest ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {trip.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                    <span>{trip.start}</span>
                    <span className="text-gray-400">→</span>
                    <span>{trip.end}</span>
                  </div>
                </div>

                {/* Vertical Divider (Hidden on mobile) */}
                <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                {/* Stats Info */}
                <div className="flex gap-6 items-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Route AQI</div>
                    <div className={`text-xl font-black ${trip.aqi > 75 ? 'text-red-600' : 'text-emerald-600'}`}>{trip.aqi}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Life Saved</div>
                    <div className="text-xl font-black text-blue-600">+{trip.lifeSaved} <span className="text-xs">mins</span></div>
                  </div>

                  {trip.cigsDodged > 0 && (
                    <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Toxins Dodged</div>
                      <div className="text-sm font-black text-gray-900">🚫 {trip.cigsDodged} cigs</div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}