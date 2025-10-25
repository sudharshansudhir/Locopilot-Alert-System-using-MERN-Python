# backend/python/collisionPredictor.py
import sys, json, math
from datetime import datetime

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)) * 1000  # meters

def time_diff_minutes(t1, t2):
    try:
        if len(t1) == 5: t1 = "2025-10-05T" + t1 + ":00"
        if len(t2) == 5: t2 = "2025-10-05T" + t2 + ":00"
        return abs((datetime.fromisoformat(t1) - datetime.fromisoformat(t2)).total_seconds() / 60)
    except:
        return 9999

def detect_collisions(trains):
    collisions = []
    for i in range(len(trains)):
        for j in range(i + 1, len(trains)):
            t1, t2 = trains[i], trains[j]

            track1 = t1.get("currentTrack") or ""
            track2 = t2.get("currentTrack") or ""
            if not track1 or not track2:
                continue

            if track1 == track2:
                lat1, lon1 = t1.get("currentLat", 0), t1.get("currentLng", 0)
                lat2, lon2 = t2.get("currentLat", 0), t2.get("currentLng", 0)
                dist = calculate_distance(lat1, lon1, lat2, lon2)
                eta_diff = time_diff_minutes(t1.get("arrivalTime", "2099-01-01T00:00:00"), 
                                             t2.get("arrivalTime", "2099-01-01T00:00:00"))

                # Collision condition
                if dist < 1000 and eta_diff < 10:
                    collisions.append({
                        "train1": t1.get("trainNumber"),
                        "train2": t2.get("trainNumber"),
                        "track": track1,
                        "distanceDiff_m": round(dist, 2),
                        "etaDiff_min": round(eta_diff, 2)
                    })
    return collisions

if __name__ == "__main__":
    try:
        data = json.loads(sys.argv[1])
        print(json.dumps(detect_collisions(data)))
    except Exception as e:
        print("PY ERR:", str(e))
