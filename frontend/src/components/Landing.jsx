import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col justify-center items-center px-4 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hackathon Track Tag */}
        <div className="inline-block px-4 py-1 mb-6 rounded-full bg-green-100 text-green-700 font-semibold text-sm tracking-wide border border-green-200">
          🌍 Planet Protectors
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Navigate the city. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
            Protect your lungs.
          </span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The first navigation app that optimizes your route for health and climate. 
          Avoid high-pollution zones, reduce your carbon footprint, and take a stand for cleaner air.
        </p>

        {/* Call to Action */}
        <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-transform hover:scale-105 shadow-xl">
          Start Navigating Clean Air →
        </Link>
      </div>

      {/* Quick Stats/Features below the fold */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center pb-12">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">😷</div>
          <h3 className="font-bold text-gray-900 mb-2">Hyperlocal AQI</h3>
          <p className="text-gray-500 text-sm">Street-by-street pollution data fused from sensors and satellite imagery.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🌱</div>
          <h3 className="font-bold text-gray-900 mb-2">Carbon Co-Benefits</h3>
          <p className="text-gray-500 text-sm">Track how much CO2 you save by choosing greener, healthier routes.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-bold text-gray-900 mb-2">Agentic Alerts</h3>
          <p className="text-gray-500 text-sm">Smart AI prompts help you avoid rush hour and peak emission times.</p>
        </div>
      </div>
    </div>
  );
}