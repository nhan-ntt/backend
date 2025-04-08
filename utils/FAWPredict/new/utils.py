import datetime
import sys
from datetime import date
import csv
import pandas as pd

from api.openWeatherAPI import openWeatherAPI
from api.visualAPI import visualAPI

regression_table = pd.read_csv("data/regression_data.csv")

DEVELOPMENT_STAGE = ['egg', 'instar_1', 'instar_2', 'instar_3', 'instar_4', 'instar_5', 'instar_6', 'pupal', 'adult']
NUM_STAGE = 8
BASE_TEMPERATURE = 20
LOCATION = "Hanoi"

start_date = str(datetime.date.today())
end_date = str(datetime.date.today() + datetime.timedelta(13))

'''
faw_table[0][i] là nhiệt độ phát triển tối thiểu cho giai đoạn thứ i.
faw_table[1][i] là giá trị k cộng dồn cho giai đoạn thứ i.
'''

# based on regression_table
def create_faw_table(regression_table):
    faw_table = [[], []]
    for i in range(0, NUM_STAGE):
        a, b = regression_table.a_parameter[i], regression_table.b_parameter[i]
        faw_table[0].append(int(-b / a))
        faw_table[1].append(int((BASE_TEMPERATURE - faw_table[0][i]) / (a * BASE_TEMPERATURE + b)))
        if 0 < i < NUM_STAGE - 1:
            faw_table[1][i] += faw_table[1][i - 1]

    print("FAW Table:", faw_table)
    return faw_table


# query time: yyyy-mm-dd
def convert_str_to_time(query_time):
    arr = query_time.split('-')
    return date(int(arr[0]), int(arr[1]), int(arr[2]))


# return weather_table
def visual():
    visual_api_key = '6PPSTB388F7H536HMUZRHXPS8'

    visual_api = visualAPI(visual_api_key, LOCATION, start_date, end_date)
    visual_api.create_api()
    visual_api.export_to_csv("data/hanoi_visual.csv")
    return visual_api.run_api()


# URL = f"https://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}"

# return forecast_data
def open_weather():
    open_weather_key = "5b24e25f4c0ddc81a6c4f676995a4c85"

    open_weather_api = openWeatherAPI(open_weather_key, LOCATION)
    open_weather_api.create_api()
    open_weather_api.run_api()
    open_weather_api.change_to_daily()  # Ensure daily information is populated
    open_weather_api.export_to_json("data/hanoi_openweather.json")

    return open_weather_api


def get_temperature(query_date):
    if isinstance(query_date, datetime.date):
        query_date = query_date.strftime('%Y-%m-%d')
    # query_date = convert_str_to_time(query_date)

    # # if query_date is later than today, lookup in forecast_data (openweatherAPI)
    # if query_date > date.today():
    #     delta = int((query_date - date.today()).days)
    #     if delta >= 30:
    #         print("Out of data range")
    #         sys.exit()
    #
    #     return forecast_data.get_mean_temperature(query_date)
    # else:
    #     # else lookup in weather_table (visualAPI)
    #     try:
    #         day_index = weather_table[weather_table['datetime'] == query_date].index.values[0]
    #     except IndexError:
    #         print("Out of data range")
    #         exit()
    #     temp = weather_table.temp[day_index]
    #     return temp

    # print(type(weather_table['datetime'][0]))
    try:
        for index, row in weather_table.iterrows():
            if row['datetime'] == query_date:
                return (row['temp'])

    except IndexError:
        print("Out of data range")


# faw_table = create_faw_table(regression_table)

# import from csv
with open("data/faw_data.csv", newline="") as faw_file:
    reader = csv.reader(faw_file, delimiter=',')
    faw_table = [[int(x) for x in row] for row in reader][1:]
    

weather_table = visual()
forecast_data = open_weather()
