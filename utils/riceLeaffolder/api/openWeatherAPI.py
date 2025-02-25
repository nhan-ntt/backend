import codecs
import csv
from datetime import datetime
from datetime import date
import json
import sys
import urllib.request
import urllib.error

import pandas as pd
import requests
from api.openAPI import openAPI


# openweather APIs
class openWeatherAPI(openAPI):
    def __init__(self, api_key, location):
        # self.base_url = "https://pro.openweathermap.org/data/2.5/forecast/climate?"

        self.api_query = None
        self.information = None
        self.base_url = "https://api.openweathermap.org/data/2.5/forecast?"

        super().__init__(api_key)
        self.location = location
        self.daily_information = None

    def create_api(self):
        self.api_query = self.base_url + "q=" + self.location + "&appid=" + self.api_key

    def run_api(self):
        try:
            response = requests.get(self.api_query)
            self.information = response.json()

        except requests.exceptions.RequestException as e:
            print("Can't process now! Failed load query")
            sys.exit()

    def get_latitude(self):
        return self.information["city"]["coord"]["lat"]

    def get_longitude(self):
        return self.information["city"]["coord"]["lon"]

    def get_temperature(self, date_query):
        delta = int((date_query - date.today()).days)
        return int(self.information["list"][delta]["main"]["temp"])

    def export_to_json(self, file_name):
        self.run_api()
        with open(file_name, 'w', encoding='utf-8') as file:
            json.dump(self.information, file, ensure_ascii=False, indent=4)
        # print(f"Successfully exported to '{file_name}'")

    def get_mean_temperature(self, date_query):
        delta = int((date_query - date.today()).days)
        return int(self.daily_information["daily"][delta]["temp"]["avg"])

    def change_to_daily(self):
        daily_summary = {}

        data = self.information

        for entry in data["list"]:
            dt = datetime.fromisoformat(entry["dt_txt"]).date()
            date = dt.strftime("%Y-%m-%d")

            if date not in daily_summary:
                daily_summary[date] = {
                    "dt": date,
                    "temp": {
                        "min": float("inf"),
                        "max": float("-inf"),
                        "sum": 0,
                        "count": 0,
                        "day": None
                    }
                }

            # Lấy thông tin nhiệt độ
            temp = entry["main"]["temp"] - 273.15  # Kelvin to Celsius
            daily_summary[date]["temp"]["min"] = min(daily_summary[date]["temp"]["min"], temp)
            daily_summary[date]["temp"]["max"] = max(daily_summary[date]["temp"]["max"], temp)
            daily_summary[date]["temp"]["sum"] += temp
            daily_summary[date]["temp"]["count"] += 1

            daily_summary[date]["temp"]["avg"] = (daily_summary[date]["temp"]["sum"]
                                                  / daily_summary[date]["temp"]["count"])

        daily_result = []
        for date, values in daily_summary.items():
            daily_result.append({
                "dt": values["dt"],
                "temp": {
                    "avg": values["temp"]["avg"],
                    "min": values["temp"]["min"],
                    "max": values["temp"]["max"]
                }
            })

        self.daily_information = {"daily": daily_result}

        # Ghi vào file JSON
        with open("data/daily_weather_temp.json", "w", encoding="utf-8") as json_file:
            json.dump(self.daily_information, json_file, ensure_ascii=False, indent=4)

        print("Successfully exported to 'daily_weather_temp.json'")
