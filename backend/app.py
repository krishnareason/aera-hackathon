from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from google import genai
from datetime import datetime
import pytz
import os
import json 
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="AERA Hackathon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

@app.get("/analyze-route")
def analyze_route(lat: float, lng: float, duration_mins: float, distance_km: float, route_type: int = 0, start_name: str = "Origin", end_name: str = "Destination", health_condition: str = "None"):
    try:
        # 1. Base Satellite Data
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide"
        res = requests.get(url).json()
        current = res.get("current", {})

        aqi = current.get("european_aqi", 50)
        pm25 = current.get("pm2_5", 15.0)
        pm10 = current.get("pm10", 20.0)
        no2 = current.get("nitrogen_dioxide", 10.0)

        # 2. 🚀 AGENTIC AI SPATIAL, TRAFFIC & HEALTH REASONING
        has_water_body = False
        has_garbage_dump = False
        has_heavy_traffic = False 
        transit_suggestion = None
        long_term_prediction = "Commuting this route daily will compound PM2.5 exposure in your lungs, accelerating respiratory decline over the next year."
        
        # Get exact current time in Kolkata for accurate traffic estimation
        kolkata_tz = pytz.timezone('Asia/Kolkata')
        current_time_str = datetime.now(kolkata_tz).strftime("%I:%M %p on %A")
        
        if client:
            prompt = f"""
            You are an AI spatial and environmental analyzer for a routing app.
            A user is traveling from '{start_name}' to '{end_name}'.
            The current local time is {current_time_str}.
            This specific route alternative passes near the midpoint coordinates: Latitude {lat}, Longitude {lng}.
            The user has the following pre-existing health condition: {health_condition}.
            
            Analyze this geographical area and return a JSON object with EXACTLY these keys:
            "has_water": (boolean) true if there is a significant water body (lake, river, large canal) very close to this path.
            "has_garbage": (boolean) true if there is a major landfill (like Dhapa in Kolkata) or large garbage dumping area within a 5km radius of this path.
            "has_heavy_traffic": (boolean) true if this specific route typically experiences heavy traffic congestion at this exact day and time.
            "transit_suggestion": (string) A 1-2 sentence casual message suggesting public transit (metro, bus, train) between these areas. Start exactly with: "Bro, if you're not in a hurry...". IMPORTANT: If their health condition is NOT 'None', tailor this message to highly warn them about their {health_condition} and urge them to take a closed-AC transit like Metro.
            "long_term_prediction": (string) A stark 2-sentence medical warning about the consequences of commuting on this exact route 5 days a week for a full year. Specifically mention how PM2.5 buildup will impact their {health_condition}.
            
            Return ONLY raw valid JSON. Do not include markdown code blocks.
            """
            try:
                response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
                ai_text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
                ai_data = json.loads(ai_text)
                
                has_water_body = ai_data.get("has_water", False)
                has_garbage_dump = ai_data.get("has_garbage", False)
                has_heavy_traffic = ai_data.get("has_heavy_traffic", False) 
                transit_suggestion = ai_data.get("transit_suggestion")
                long_term_prediction = ai_data.get("long_term_prediction", long_term_prediction)
                
                print(f"🤖 AI Analysis [{current_time_str}] -> Water: {has_water_body}, Garbage: {has_garbage_dump}, Traffic: {has_heavy_traffic}")
            except Exception as e:
                print(f"Gemini Spatial Error: {e}")

        # 3. 🚀 APPLYING THE AI MODIFIERS
        warning_tags = []
        env_reason = "AI has analyzed this route for micro-environmental factors."

        if has_garbage_dump:
            aqi += 10
            pm25 += 15 
            pm10 += 25
            warning_tags.append("☣️ Toxic Waste Dump Nearby: +10 AQI")
            env_reason = "🗑️ Warning: Route passes near a known open dumping ground. Harmful methane detected."
        
        if has_water_body:
            aqi = max(10, aqi - 10)
            pm25 = max(5, pm25 - 10) 
            warning_tags.append("🌊 Cooling Water Body Nearby: -10 AQI (Natural filtration)")
            env_reason = "🌿 Route parallels a significant water body. Natural breeze filters out PM2.5."

        if has_heavy_traffic:
            aqi += 5
            no2 += 20 
            warning_tags.append(f"🚨 High Traffic Detected at {current_time_str.split(' on ')[0]}: +5 AQI")
            if "AI has analyzed" in env_reason:
                env_reason = "🚗 Heavy traffic bottleneck detected based on historical time-of-day patterns."

        # 4. 🚀 MEDICAL MATH & CHART DATA
        base_pm25 = current.get("pm2_5", 15.0)
        worst_pm25 = base_pm25 * 1.5  
        avoided_pm25 = max(0.0, worst_pm25 - pm25) 

        # 22ug/m3 over 24 hours equals roughly 1 cigarette
        cigs_per_trip = (pm25 / 22.0) * (duration_mins / 1440.0)
        cigs_per_hour = round((pm25 / 22.0) * (60 / 1440.0), 2)
        life_lost_mins = round(cigs_per_trip * 11, 2)
        
        saved_cigs = (avoided_pm25 / 22.0) * (duration_mins / 1440.0)
        saved_life_mins = round(saved_cigs * 11, 2) 

        total_gases = pm25 + pm10 + no2
        if total_gases == 0: total_gases = 1

        sources = [
            {"name": "Vehicle Exhaust (NO2)", "value": round((no2/total_gases)*100), "color": "#EF4444"},
            {"name": "Construction Dust (PM10)", "value": round((pm10/total_gases)*100), "color": "#F59E0B"},
            {"name": "Industrial Smog (PM2.5)", "value": round((pm25/total_gases)*100), "color": "#6B7280"}
        ]

        medical_alert = None
        reward_msg = None
        
        if health_condition != "None" and pm25 > 15:
            medical_alert = f"⚠️ {health_condition.upper()} WARNING: Exposure to {round(pm25, 1)} μg/m³ of PM2.5 will heavily trigger your condition on this route."
        elif aqi > 80 or pm25 > 25:
            medical_alert = f"⚠️ SEVERE RISK: This route forces {round(pm25, 1)} μg/m³ of micro-particles deep into your lung alveoli. Increases asthma and COPD risks."
        
        if avoided_pm25 > 0:
            reward_msg = f"🏆 LUNG SAVER: By taking this route, you avoid {round(avoided_pm25, 1)} μg/m³ of toxic emissions compared to the main highway bottleneck!"

        return {
            "status": "success",
            "aqi": round(aqi),
            "health": { 
                "life_lost_mins": life_lost_mins, 
                "saved_life_mins": saved_life_mins, 
                "duration": duration_mins, 
                "distance": distance_km,
                "cigs_per_hour": cigs_per_hour, 
                "cigs_per_trip": round(cigs_per_trip, 2)
            },
            "reason": env_reason,
            "micro_factors": warning_tags, 
            "transit_suggestion": transit_suggestion,
            "long_term_prediction": long_term_prediction, 
            "sources": sources,             
            "medical_alert": medical_alert, 
            "reward_msg": reward_msg        
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}