import argparse
import sys
import webbrowser
from pathlib import Path
import requests


def fetch_weather(location):
    url = f"https://wttr.in/{location}?format=j1"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    current = data.get("current_condition", [{}])[0]
    temp_c = current.get("temp_C", "N/A")
    feels_c = current.get("FeelsLikeC", "N/A")
    desc = current.get("weatherDesc", [{}])[0].get("value", "N/A")
    humidity = current.get("humidity", "N/A")
    return {"temp_c": temp_c, "feels_c": feels_c, "desc": desc, "humidity": humidity}


def build_html(location, weather):
    html = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Weather Dashboard</title>
  <style>
    body {{ font-family: Arial, sans-serif; background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; margin: 0; padding: 40px; display: flex; justify-content: center; }}
    .card {{ background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }}
    h1 {{ margin-top: 0; font-size: 28px; }}
    .row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }}
    .label {{ font-weight: bold; }}
  </style>
</head>
<body>
  <div class=\"card\">
    <h1>Weather Dashboard</h1>
    <div class=\"row\"><span class=\"label\">Location</span><span>{location}</span></div>
    <div class=\"row\"><span class=\"label\">Temperature</span><span>{weather['temp_c']}°C</span></div>
    <div class=\"row\"><span class=\"label\">Feels Like</span><span>{weather['feels_c']}°C</span></div>
    <div class=\"row\"><span class=\"label\">Condition</span><span>{weather['desc']}</span></div>
    <div class=\"row\"><span class=\"label\">Humidity</span><span>{weather['humidity']}%</span></div>
  </div>
</body>
</html>
"""
    return html


def main():
    parser = argparse.ArgumentParser(description="Check weather for a location using wttr.in")
    parser.add_argument("location", nargs="?", default=None, help="Location (e.g., 'Indian' or 'Paris,FR'). If omitted, you will be prompted to enter one.")
    args = parser.parse_args()

    location = args.location
    if not location:
        location = input("Enter place name: ").strip()
        if not location:
            print("Please enter a place name.", file=sys.stderr)
            sys.exit(1)

    try:
        w = fetch_weather(location)
    except Exception as e:
        print("Error fetching weather:", e, file=sys.stderr)
        sys.exit(1)

    html_path = Path("weather_dashboard.html")
    html_path.write_text(build_html(location, w), encoding="utf-8")
    webbrowser.open(str(html_path.resolve()))
    print(f"Opened weather dashboard for {location} in your browser.")


if __name__ == "__main__":

    main()
