import { useState, useEffect } from 'react';

export default function Settings() {
  const [healthCondition, setHealthCondition] = useState('None');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const savedCondition = localStorage.getItem('aera_healthCondition') || 'None';
    setHealthCondition(savedCondition);

    // 🛠️ Fetch the logged-in user's details
    const email = localStorage.getItem('userEmail') || 'guest@aera.com';
    setUserEmail(email);
    setUserName(email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('aera_healthCondition', healthCondition);
    alert('Medical Profile Updated. AERA AI will now personalize your routes.');
  };

  const clearData = () => {
    if(window.confirm("Are you sure you want to delete your Impact Vault data?")) {
      localStorage.removeItem('aera_lifeSaved');
      localStorage.removeItem('aera_routesTaken');
      localStorage.removeItem('aera_toxicDodged');
      localStorage.removeItem('aera_transitTaken');
      alert("Account data wiped clean.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-8 pb-12 flex flex-col items-center">
      <div className="w-full max-w-[800px]">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-8">System Settings</h1>

        {/* 🛠️ NEW: ACCOUNT OVERVIEW */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg flex items-center justify-center text-white text-3xl font-black">
            {userName.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">{userName}'s Profile</h3>
            <p className="text-gray-500 font-medium">{userEmail}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active AERA Citizen</span>
          </div>
        </div>

        {/* PROFILE MANAGEMENT */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Medical Profile</h3>
          <p className="text-gray-500 mb-6 text-sm">AERA uses your medical profile to dynamically adjust AI routing suggestions and toxicity warnings.</p>
          
          <label className="block text-sm font-bold text-gray-700 mb-2">Pre-existing Lung Condition</label>
          <select 
            value={healthCondition}
            onChange={(e) => setHealthCondition(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 mb-4 font-medium text-gray-700"
          >
            <option value="None">None (Healthy)</option>
            <option value="Asthma">Asthma</option>
            <option value="COPD">COPD (Chronic Obstructive Pulmonary Disease)</option>
            <option value="Bronchitis">Chronic Bronchitis</option>
            <option value="Pregnant">Pregnant (High Risk)</option>
          </select>

          <button onClick={saveSettings} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
            Save Medical Profile
          </button>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-red-50 p-8 rounded-3xl border border-red-200">
          <h3 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h3>
          <p className="text-red-700 mb-6 text-sm">This action cannot be undone. It will reset your badges, levels, and saved life expectancy.</p>
          <button onClick={clearData} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition shadow-md">
            Erase Impact Vault Data
          </button>
        </div>

      </div>
    </div>
  );
}