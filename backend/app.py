from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from google import genai
from datetime import datetime
import pytz
import os
import json 
import overpy
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="AERA Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None
overpass_api = overpy.Overpass()

def get_point_aqi(lat, lng):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide"
    try:
        res = requests.get(url).json().get("current", {})
        return {
            "aqi": res.get("european_aqi", 50),
            "pm25": res.get("pm2_5", 15.0),
            "pm10": res.get("pm10", 20.0),
            "no2": res.get("nitrogen_dioxide", 10.0)
        }
    except:
        return {"aqi": 50, "pm25": 15.0, "pm10": 20.0, "no2": 10.0}

@app.get("/analyze-route")
def analyze_route(
    start_lat: float, start_lng: float, 
    mid_lat: float, mid_lng: float, 
    end_lat: float, end_lng: float, 
    duration_mins: float, distance_km: float, 
    route_type: int = 0, start_name: str = "Origin", end_name: str = "Destination", health_condition: str = "None"
):
    try:
        pt1 = get_point_aqi(start_lat, start_lng)
        pt2 = get_point_aqi(mid_lat, mid_lng)
        pt3 = get_point_aqi(end_lat, end_lng)

        aqi = (pt1["aqi"] + pt2["aqi"] + pt3["aqi"]) / 3
        pm25 = (pt1["pm25"] + pt2["pm25"] + pt3["pm25"]) / 3
        pm10 = (pt1["pm10"] + pt2["pm10"] + pt3["pm10"]) / 3
        no2 = (pt1["no2"] + pt2["no2"] + pt3["no2"]) / 3

        has_water_body = False
        has_garbage_dump = False
        
        try:
            query = f"""
            [out:json];
            (
              way["natural"="water"](around:800, {mid_lat}, {mid_lng});
              way["landuse"="landfill"](around:1500, {mid_lat}, {mid_lng});
            );
            out tags;
            """
            result = overpass_api.query(query)
            for way in result.ways:
                if way.tags.get("natural", "") == "water":
                    has_water_body = True
                if way.tags.get("landuse", "") == "landfill":
                    has_garbage_dump = True
        except Exception as e:
            print(f"Overpass GIS Error: {e}")

        kolkata_tz = pytz.timezone('Asia/Kolkata')
        current_time_str = datetime.now(kolkata_tz).strftime("%I:%M %p on %A")
        
        transit_suggestion = None
        long_term_prediction = "Commuting this route daily compounds PM2.5 exposure, accelerating respiratory decline."
        env_reason = "Standard urban route analyzed."

        if client:
            prompt = f"""
            You are a strict medical/environmental summarizer.
            Route: '{start_name}' to '{end_name}'. Time: {current_time_str}. Health condition: {health_condition}.
            
            HARD FACTS (Do not invent spatial data):
            - Average Route AQI: {round(aqi)}
            - Near Water Body: {has_water_body}
            - Near Landfill: {has_garbage_dump}
            - PM2.5 Level: {round(pm25, 1)} μg/m³
            
            Return a JSON object with EXACTLY these keys:
            "transit_suggestion": (string) Casual 1-sentence suggestion for closed-AC transit like Metro. Start with: "Bro, if you're not in a hurry...". Tailor to their health condition.
            "long_term_prediction": (string) A harsh 2-sentence medical warning about 1-year exposure to {pm25} μg/m³ PM2.5, referencing their {health_condition}.
            "env_reason": (string) 1-sentence explaining the route. e.g., "Passes near a water body which cools the air." or "High PM2.5 detected across the corridor."
            
            Return ONLY raw valid JSON. No markdown.
            """
            try:
                response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
                ai_text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
                ai_data = json.loads(ai_text)
                
                transit_suggestion = ai_data.get("transit_suggestion")
                long_term_prediction = ai_data.get("long_term_prediction", long_term_prediction)
                env_reason = ai_data.get("env_reason", env_reason)
            except Exception as e:
                print(f"Gemini Summarization Error: {e}")

        warning_tags = []
        if has_garbage_dump:
            warning_tags.append("☣️ Verified Open Dumping Ground < 1.5km")
        if has_water_body:
            warning_tags.append("🌊 Verified Water Body Cooling Zone")
        if no2 > 15:
            warning_tags.append(f"🚨 Severe NO2 levels detected")

        base_pm25 = 20.0
        avoided_pm25 = max(0.0, base_pm25 - pm25) 
        
        cigs_per_trip = (pm25 / 22.0) * (duration_mins / 1440.0)
        cigs_per_hour = round((pm25 / 22.0) * (60 / 1440.0), 2)
        life_lost_mins = round(cigs_per_trip * 11, 2)
        saved_life_mins = round(((avoided_pm25 / 22.0) * (duration_mins / 1440.0)) * 11, 2) 

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
            medical_alert = f"⚠️ {health_condition.upper()} WARNING: Verified exposure to {round(pm25, 1)} μg/m³ of PM2.5."
        elif aqi > 80:
            medical_alert = f"⚠️ SEVERE RISK: Route forces {round(pm25, 1)} μg/m³ of micro-particles deep into alveoli."
        
        if avoided_pm25 > 0 and aqi < 75:
            reward_msg = f"🏆 LUNG SAVER: Verifiably lower PM2.5 levels compared to regional baselines."

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