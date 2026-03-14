import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🚀 CUSTOM EMOJI MARKER GENERATOR
const createEmojiIcon = (emoji, bgColor = "white") => L.divIcon({
  html: `<div style="font-size: 20px; background: ${bgColor}; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 2px solid #111; animation: bounce 2s infinite;">${emoji}</div>`,
  className: 'custom-emoji',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

function MapUpdater({ startPoint, endPoint }) {
  const map = useMap();
  useEffect(() => {
    if (startPoint && endPoint) {
      const bounds = L.latLngBounds([startPoint, endPoint]);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [startPoint, endPoint, map]);
  return null;
}

export default function MapCanvas({ routes, selectedIndex, onRouteSelect, startPoint, endPoint, startName, endName }) {
  const [mapTheme, setMapTheme] = useState('dark'); // 🛰️ State for Map Theme
  const selectedRoute = routes[selectedIndex];
  
  let activeColor = '#3B82F6'; 
  if (selectedRoute?.data?.aqi < 75) activeColor = '#10B981'; 
  if (selectedRoute?.data?.aqi > 75) activeColor = '#EF4444'; 

  // Map URLs
  const darkMap = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const satelliteMap = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className="w-full h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 z-0 relative group">
      
      {/* 🚀 INJECTED CSS FOR ANIMATIONS */}
      <style>{`
        .flowing-route {
          stroke-dasharray: 15, 15;
          animation: flow 1s linear infinite;
        }
        @keyframes flow {
          0% { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* 🛰️ SATELLITE TOGGLE BUTTON */}
      <button 
        onClick={() => setMapTheme(mapTheme === 'dark' ? 'satellite' : 'dark')}
        className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur text-gray-900 font-bold px-4 py-2 rounded-lg shadow-lg border border-gray-300 hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
      >
        {mapTheme === 'dark' ? '🛰️ Satellite View' : '🌑 Dark Mode'}
      </button>

      <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <MapUpdater startPoint={startPoint} endPoint={endPoint} />
        
        <TileLayer 
          url={mapTheme === 'dark' ? darkMap : satelliteMap} 
          attribution='&copy; AERA Hackathon'
        />

        {/* Render unselected routes as faint lines */}
        {routes.map((route, index) => {
          if (index === selectedIndex) return null; 
          return (
            <Polyline 
              key={`bg-${index}`}
              positions={route.path} 
              color="#9CA3AF" 
              weight={6} 
              opacity={0.4} 
              eventHandlers={{ click: () => onRouteSelect(index) }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
          );
        })}

        {/* 🚀 Render the ACTIVE route with the FLOWING animation */}
        {selectedRoute && (
          <Polyline 
            key={`active-${selectedIndex}`}
            positions={selectedRoute.path} 
            color={activeColor} 
            weight={8} 
            opacity={0.9} 
            className="flowing-route cursor-pointer"
          />
        )}

        {/* 📍 AI MICRO-FACTOR MARKERS ON THE MAP */}
        {selectedRoute?.data?.micro_factors?.map((factor, idx) => {
          const midPoint = selectedRoute.path[Math.floor(selectedRoute.path.length / 2)];
          
          let emoji = null;
          let bgColor = "white";
          if (factor.includes("🌊")) { emoji = "🌊"; bgColor = "#DBEAFE"; }
          if (factor.includes("☣️") || factor.includes("🗑️")) { emoji = "☣️"; bgColor = "#FEF3C7"; }
          if (factor.includes("🚨") || factor.includes("🚗")) { emoji = "🚨"; bgColor = "#FFEDD5"; }

          if (emoji && midPoint) {
            return (
              <Marker key={`factor-${idx}`} position={midPoint} icon={createEmojiIcon(emoji, bgColor)}>
                <Popup>
                  <div className="font-bold text-gray-800 text-sm">{factor}</div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {/* START AND END MARKERS */}
        {startPoint && (
          <Marker position={startPoint}>
            <Popup><span className="font-bold text-gray-800">Start: {startName || "Origin"}</span></Popup>
          </Marker>
        )}
        {endPoint && (
          <Marker position={endPoint}>
            <Popup><span className="font-bold text-gray-800">Destination: {endName || "Destination"}</span></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}