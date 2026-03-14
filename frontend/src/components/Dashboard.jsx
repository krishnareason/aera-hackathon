import { useState, useEffect } from 'react';
import axios from 'axios';
import MapCanvas from './MapCanvas';
import PollutionChart from './PollutionChart';

export default function Dashboard() {
  const [startLoc, setStartLoc] = useState("Ruby, Kolkata");
  const [endLoc, setEndLoc] = useState("Salt Lake, Kolkata");
  const [isRouting, setIsRouting] = useState(false);
  // 🚀 Get User's Name from Email
  const userEmail = localStorage.getItem('userEmail') || 'guest@aera.com';
  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [aiAlert, setAiAlert] = useState(null); 
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🚀 Gamification & Prediction States
  const [surveyAnswers, setSurveyAnswers] = useState({ transit: false, carpool: false });
  const [isRegularCommute, setIsRegularCommute] = useState(false);

  // Stop audio if user clicks a different route
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [selectedIndex]);

  const calculateRealRoute = async () => {
    if (!startLoc || !endLoc) return;
    setIsRouting(true);
    setAiAlert(null); 
    setSurveyAnswers({ transit: false, carpool: false }); 
    window.speechSynthesis.cancel(); 
    setIsSpeaking(false);
    
    try {
      const startRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${startLoc}`);
      const endRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${endLoc}`);
      
      if (startRes.data.length > 0 && endRes.data.length > 0) {
        const start = [parseFloat(startRes.data[0].lat), parseFloat(startRes.data[0].lon)];
        const end = [parseFloat(endRes.data[0].lat), parseFloat(endRes.data[0].lon)];
        setStartCoords(start);
        setEndCoords(end);

        const baseUrl = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const baseRes = await axios.get(baseUrl);
        const baseRoute = baseRes.data.routes[0];

        const basePath = baseRoute.geometry.coordinates;
        const baseMid = basePath[Math.floor(basePath.length / 2)]; 

        const mid1 = [baseMid[0] + 0.025, baseMid[1] + 0.025]; 
        const mid2 = [baseMid[0] - 0.025, baseMid[1] - 0.025]; 

        const alt1Url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${mid1[0]},${mid1[1]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const alt2Url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${mid2[0]},${mid2[1]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

        const [alt1Res, alt2Res] = await Promise.all([
            axios.get(alt1Url).catch(() => null),
            axios.get(alt2Url).catch(() => null)
        ]);

        const rawRoutes = [
            { r: baseRoute, type: "Fastest Route (Main Highway)", isFastest: true },
        ];
        if (alt1Res?.data?.routes?.[0]) rawRoutes.push({ r: alt1Res.data.routes[0], type: "Eco-Bypass Alternative 1", isFastest: false });
        if (alt2Res?.data?.routes?.[0]) rawRoutes.push({ r: alt2Res.data.routes[0], type: "Eco-Bypass Alternative 2", isFastest: false });

        // 🛠️ Get Health Condition from Settings
        const userHealth = localStorage.getItem('aera_healthCondition') || 'None';

        const analyzedRoutes = [];
        for (let i = 0; i < rawRoutes.length; i++) {
            const { r, type, isFastest } = rawRoutes[i];
            const path = r.geometry.coordinates.map(c => [c[1], c[0]]);
            const mid = path[Math.floor(path.length / 2)];
            const time = Math.round(r.duration / 60);
            const dist = (r.distance / 1000).toFixed(1);

            // 🛠️ Pass health_condition to Backend
            const rData = await axios.get(`http://127.0.0.1:8000/analyze-route?lat=${mid[0]}&lng=${mid[1]}&duration_mins=${time}&distance_km=${dist}&route_type=${i}&start_name=${startLoc}&end_name=${endLoc}&health_condition=${userHealth}`);
            
            if (rData.data.status === "error") continue; 

            analyzedRoutes.push({ id: i, path: path, data: rData.data, originalName: type, isFastest: isFastest });
        }

        analyzedRoutes.sort((a, b) => a.data.aqi - b.data.aqi);

        const fastestRouteAnalyzed = analyzedRoutes.find(r => r.isFastest);
        if (fastestRouteAnalyzed?.data?.ai_concierge_alert) {
            setAiAlert(fastestRouteAnalyzed.data.ai_concierge_alert);
        }

        setRoutes(analyzedRoutes);
        setSelectedIndex(0); 
      }
    } catch (error) {
      console.error("Routing Error:", error);
    } finally {
      setIsRouting(false);
    }
  };

  const activeRoute = routes[selectedIndex];

  // 🎙️ Web Speech API
  const toggleAudioBriefing = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (activeRoute && activeRoute.data) {
      let script = `AERA System Briefing. ${activeRoute.data.reason} `;
      if (activeRoute.data.transit_suggestion) script += `${activeRoute.data.transit_suggestion} `;
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.95; 
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 🚀 GAMIFICATION LOGIC
  const logRouteTaken = () => {
    if (!activeRoute || !activeRoute.data) return;
    let currentLife = parseFloat(localStorage.getItem('aera_lifeSaved') || 0);
    let currentRoutes = parseInt(localStorage.getItem('aera_routesTaken') || 0);
    let currentToxic = parseInt(localStorage.getItem('aera_toxicDodged') || 0);

    let newLifeSaved = activeRoute.data.health?.saved_life_mins || 0;
    localStorage.setItem('aera_lifeSaved', currentLife + parseFloat(newLifeSaved));
    localStorage.setItem('aera_routesTaken', currentRoutes + 1);

    if (!activeRoute.isFastest) {
      localStorage.setItem('aera_toxicDodged', currentToxic + 1);
    }
    alert(`Route Logged! +${newLifeSaved} mins of life saved added to your Vault!`);
  };

  const handleSurveyAnswer = (type) => {
    setSurveyAnswers(prev => ({ ...prev, [type]: true }));
    if (type === 'transit') {
      let currentTransit = parseInt(localStorage.getItem('aera_transitTaken') || 0);
      localStorage.setItem('aera_transitTaken', currentTransit + 1);
    }
  };

  return (
    <div className="min-h-screen pt-4 bg-gray-50 flex flex-col items-center px-4 pb-10">
      <style>{`
        .wave-bar { width: 3px; height: 10px; background-color: #34d399; animation: wave 1s ease-in-out infinite; border-radius: 2px; }
        .wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { animation-delay: 0.3s; }
        @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(2.5); } }
      `}</style>

      <div className="w-full max-w-[1400px] mb-4 flex justify-between items-end">
        <div>
          {/* 🛠️ PERSONALIZED GREETING */}
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Let's map out the biologically safest route for your lungs today.</p>
        </div>
      </div>

      {aiAlert && (
        <div className="w-full max-w-[1400px] mb-6 bg-indigo-900 border border-indigo-500 text-indigo-50 p-4 rounded-xl shadow-lg flex items-center gap-4 animate-fade-in shrink-0">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="font-bold text-indigo-300 text-sm uppercase tracking-wider mb-1">Agentic AI Concierge</h3>
            <p className="text-sm font-medium">{aiAlert}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1400px] relative z-0 flex gap-4">
        
        {/* LEFT PANEL */}
        <div className="w-[350px] flex flex-col gap-4 z-[1000]">
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-200 shrink-0">
            <input type="text" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} className="w-full mb-2 p-2 text-sm border rounded" placeholder="Start Location" />
            <input type="text" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} className="w-full mb-3 p-2 text-sm border rounded" placeholder="Destination" />
            <button onClick={calculateRealRoute} disabled={isRouting} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">
              {isRouting ? "Scanning Satellites & AI Map..." : "Find Alternatives"}
            </button>
          </div>

          {routes.map((route, index) => (
            <div 
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`p-4 rounded-2xl shadow-md border cursor-pointer transition-all shrink-0 ${selectedIndex === index ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 transform scale-105' : 'bg-white border-gray-200 hover:bg-gray-50 opacity-80'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{route.originalName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${route.data.aqi < 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  AQI: {route.data.aqi}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{route.data.health.distance} km • {route.data.health.duration} mins</p>
              <div className="mt-3 p-2 bg-white/60 rounded text-xs text-gray-700 leading-snug border border-gray-100">
                {route.data.reason}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER MAP & INTERACTION AREA */}
        <div className="flex-1 flex flex-col gap-4 relative z-0">
          <MapCanvas 
            routes={routes} 
            selectedIndex={selectedIndex} 
            onRouteSelect={setSelectedIndex} 
            startPoint={startCoords} 
            endPoint={endCoords} 
            startName={startLoc} 
            endName={endLoc}     
          />

          {/* 🚀 ECO-SURVEY UI */}
          {activeRoute && (
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 shrink-0 animate-fade-in flex flex-col xl:flex-row items-center justify-between gap-4 z-[1000]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌱</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">AERA Eco-Impact Survey</h4>
                  <p className="text-xs text-gray-500">Earn points for your Vault by making green choices.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 justify-center">
                <button 
                  onClick={() => handleSurveyAnswer('transit')}
                  disabled={surveyAnswers.transit}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${surveyAnswers.transit ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-300' : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300'}`}
                >
                  {surveyAnswers.transit ? '✓ Logged Transit' : '🚆 Taking Public Transit?'}
                </button>
                <button 
                  onClick={() => handleSurveyAnswer('carpool')}
                  disabled={surveyAnswers.carpool}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${surveyAnswers.carpool ? 'bg-blue-100 text-blue-700 cursor-not-allowed border border-blue-300' : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300'}`}
                >
                  {surveyAnswers.carpool ? '✓ Logged Carpool' : '🚙 Carpooling Today?'}
                </button>
                
                {/* 🛠️ PREDICTOR TOGGLE */}
                {/* 🛠️ PREDICTOR TOGGLE: Yes/No Buttons */}
                <div className="border-l border-gray-300 pl-4 ml-2 flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Is this a regular commute?</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsRegularCommute(true)}
                      className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${isRegularCommute ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'}`}
                    >
                      YES
                    </button>
                    <button 
                      onClick={() => setIsRegularCommute(false)}
                      className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${!isRegularCommute ? 'bg-gray-800 text-white border border-gray-900 shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'}`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Drama & Data */}
        {activeRoute && activeRoute.data && (
          <div className="w-[340px] z-[1000] flex flex-col gap-4 overflow-y-auto h-[85vh] pb-32 pr-2 custom-scrollbar">
            
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=${startCoords[0]},${startCoords[1]}&destination=${endCoords[0]},${endCoords[1]}&waypoints=${activeRoute.path[Math.floor(activeRoute.path.length / 2)][0]},${activeRoute.path[Math.floor(activeRoute.path.length / 2)][1]}`}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={logRouteTaken} // GAMIFICATION HOOK
              className="shrink-0 w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-2xl shadow-xl flex justify-center items-center gap-2 hover:bg-black transition-transform transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Open in Google Maps
            </a>

            <div className="shrink-0">
              <PollutionChart activeRouteData={activeRoute.data} />
            </div>

            {/* 🚬 CIGARETTE EQUIVALENT CARD */}
            {activeRoute.data.health?.cigs_per_hour !== undefined && (
              <div className="shrink-0 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Air Toxicity Rate</h4>
                  <div className="text-2xl font-black mt-1">{activeRoute.data.health.cigs_per_hour} <span className="text-sm text-gray-400 font-medium">Cigs / Hour</span></div>
                </div>
                <div className="text-4xl">🚬</div>
              </div>
            )}

            {/* 🔮 LONG TERM IMPACT PREDICTOR */}
            {isRegularCommute && activeRoute.data && (
              <div className="shrink-0 bg-purple-50 border border-purple-200 p-5 rounded-2xl shadow-xl animate-fade-in mt-2">
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2"><span>🔮</span> 1-YEAR AI FORECAST</h3>
                
                {/* 🤖 The personalized text generated by Gemini */}
                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm mb-4">
                  <p className="text-sm text-purple-800 font-medium leading-relaxed italic">
                    "{activeRoute.data.long_term_prediction}"
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">1 Week</div>
                    <div className="font-black text-purple-700">{(activeRoute.data.health.cigs_per_trip * 10).toFixed(1)}</div>
                    <div className="text-[10px] text-gray-400">cigs</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">1 Month</div>
                    <div className="font-black text-purple-700">{(activeRoute.data.health.cigs_per_trip * 40).toFixed(0)}</div>
                    <div className="text-[10px] text-gray-400">cigs</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-purple-200 text-center bg-purple-100">
                    <div className="text-[10px] font-bold text-purple-800 uppercase leading-tight mb-1">1 Year</div>
                    <div className="font-black text-red-600 text-lg">{(activeRoute.data.health.life_lost_mins * 480 / 60).toFixed(1)}</div>
                    <div className="text-[9px] text-purple-800 font-bold leading-tight mt-1">Hrs Lost</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI TAGS */}
            {activeRoute.data.micro_factors && activeRoute.data.micro_factors.length > 0 && (
              <div className="shrink-0 flex flex-col gap-2 animate-fade-in">
                {activeRoute.data.micro_factors.map((factor, idx) => {
                  let bgColor = "bg-gray-100 border-gray-200 text-gray-800";
                  if (factor.includes("🌊")) bgColor = "bg-blue-50 border-blue-200 text-blue-800";
                  if (factor.includes("☣️") || factor.includes("🗑️")) bgColor = "bg-yellow-50 border-yellow-300 text-yellow-900";
                  if (factor.includes("🚨") || factor.includes("🚗")) bgColor = "bg-orange-50 border-orange-200 text-orange-900";
                  return <div key={idx} className={`p-3 rounded-xl border shadow-sm text-sm font-semibold leading-snug ${bgColor}`}>{factor}</div>;
                })}
              </div>
            )}

            {/* AI TRANSIT */}
            {activeRoute.data.transit_suggestion && (
              <div className="shrink-0 bg-[#064e3b] border border-[#10b981] text-emerald-50 p-4 rounded-2xl shadow-xl flex flex-col gap-3 animate-fade-in mt-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚇</span>
                    <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">AI Transit Alternative</h3>
                  </div>
                  <button onClick={toggleAudioBriefing} className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    {isSpeaking ? (
                      <><div className="flex items-center gap-1 h-3"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>Stop</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Listen</>
                    )}
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-emerald-100">"{activeRoute.data.transit_suggestion}"</p>
              </div>
            )}

            {/* MEDICAL ALERT */}
            {activeRoute.data.medical_alert && (
              <div className="shrink-0 bg-red-50 p-5 rounded-2xl shadow-xl border border-red-200 animate-fade-in mt-2">
                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><span>🚨</span> TOXIC CORRIDOR</h3>
                <p className="text-sm text-red-900 leading-relaxed font-medium">{activeRoute.data.medical_alert}</p>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <span className="text-xs text-red-600 uppercase font-bold">Life Expectancy Impact</span>
                  <div className="text-3xl font-black text-red-700">-{activeRoute.data.health.life_lost_mins} Mins</div>
                </div>
              </div>
            )}

            {/* REWARD MSG */}
            {activeRoute.data.reward_msg && (
              <div className="shrink-0 bg-green-50 p-5 rounded-2xl shadow-xl border border-green-200 animate-fade-in mt-2">
                <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2"><span>🛡️</span> OPTIMAL HEALTH</h3>
                <p className="text-sm text-green-900 leading-relaxed font-medium">{activeRoute.data.reward_msg}</p>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <span className="text-xs text-green-600 uppercase font-bold">Health Restored</span>
                  <div className="text-3xl font-black text-green-700">+{activeRoute.data.health.saved_life_mins > 0 ? activeRoute.data.health.saved_life_mins : 0.1} Mins</div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}