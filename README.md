# 🌍 AERA: Agentic AI-Powered Eco-Routing Engine

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-success?style=for-the-badge&logo=firebase)](https://aera-hackathon-b3711.web.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)

**AERA** (Agentic Eco-Routing Assistant) is a full-stack, context-aware GIS routing platform that prioritizes human biology over sheer speed. By orchestrating real-time spatial telemetry, open-source routing, and Google's Gemini 2.5 Flash, AERA calculates the biologically safest route for commuters to minimize PM2.5 and toxic gas exposure.

🏆 **Achievement:** Top 30 / 450+ Participants @ *Hack Among Us (2026)*

---

## 🚀 The Problem & The Solution

**The Problem:** Standard navigation apps (like Google Maps) optimize purely for distance and time. In heavily polluted urban centers, the "fastest" route often funnels commuters through highly toxic micro-environments (e.g., industrial zones, heavy traffic corridors), silently impacting long-term respiratory health.

**The Solution:** AERA introduces **Health-Optimized Routing**. By parsing a multi-node route through a custom AI orchestrator, AERA analyzes hyperlocal air quality and geographical features (water bodies, landfills) to offer eco-bypasses. It translates abstract AQI numbers into tangible biological metrics: *Cigarettes smoked per hour* and *Minutes of life lost/saved.*

---

## 🧠 System Architecture & "Agentic" Design

AERA does not rely on slow, hallucination-prone native LLM tool-calling. Instead, it utilizes a **Deterministic Orchestrator Pipeline**:

1. **Sensory Layer (Parallel Data Fetching):** The FastAPI backend receives coordinate geometry and simultaneously queries the **Open-Meteo API** (Hyperlocal AQI/PM2.5) and the **Overpass API** (OpenStreetMap spatial queries for nearby cooling zones or dumping grounds).
2. **Context Assembly:** The system calculates the physiological impact (e.g., equivalent cigarette exposure) based on the user's specific medical profile (e.g., Asthma).
3. **Reasoning Engine:** The aggregated hard facts are injected into **Gemini 2.5 Flash**, forcing the LLM to act as a strict medical/environmental summarizer. It returns a structured JSON payload containing personalized transit suggestions and 1-year long-term exposure forecasts.

---

## ✨ Key Features

* 🗺️ **Multi-Node Eco-Routing:** Fetches base routes via OSRM and programmatically calculates geographical bypasses to test for cleaner air corridors.
* 🤖 **Audio AI Concierge:** Real-time, text-to-speech environmental briefings generated dynamically by Gemini.
* 📊 **Gamified "Impact Vault":** A chronological ledger that tracks cumulative PM2.5 dodged and "minutes of life saved," incentivizing green transit choices.
* 🚨 **Hyperlocal Spatial Awareness:** Detects micro-factors like nearby water bodies (cooling effects) or landfills (toxic zones) within a 1.5km radius of the route.
* ⚡ **Edge-Ready Performance:** Vite/React frontend deployed on Firebase Hosting for sub-second delivery, backed by a scalable Python environment on Render.

---

## 🛠️ Tech Stack

**Frontend (Client)**
* React.js (Vite)
* Tailwind CSS (Styling & Animations)
* Axios (HTTP Client)
* Firebase Hosting

**Backend (Agentic Orchestrator)**
* Python 3.x
* FastAPI & Uvicorn
* Google GenAI SDK (Gemini 2.5 Flash)
* Overpy (OpenStreetMap Overpass API wrapper)

**External APIs & Integrations**
* **OSRM** (Open Source Routing Machine)
* **Open-Meteo API** (European AQI & Particulate Matter)
* **Nominatim** (Geocoding)

---

## 💻 Local Installation

Want to run AERA on your local machine? Follow these steps:
```
### 1. Clone the repository

git clone [https://github.com/krishnareason/aera-hackathon.git](https://github.com/krishnareason/aera-hackathon.git)
cd aera-hackathon

### 2. Setup the Backend (FastAPI)

cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

Create a .env file in the backend folder and add your Gemini API Key: GEMINI_API_KEY=your_google_api_key_here

Start the server: uvicorn app:app --reload

### 3. Setup the Frontend (React/Vite)

Open a new terminal window:
cd frontend
npm install
npm run dev

The app will be running at http://localhost:5173.
```
# 👨‍💻 Developed By
Krishna Srivastava

Built with passion, caffeine, and clean air in mind for Hack Among Us 2026.
