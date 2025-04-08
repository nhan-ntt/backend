from numpy import base_repr
import pandas as pd
import math
import csv
import codecs
import urllib.request
import urllib.error
import datetime
from datetime import date
from api.weather_call import visualAPI, geocodingAPI
import sys

from pyparsing import col

global weather_table
regression_table = pd.read_csv("data/regression_data.csv")
"""
faw_table = [[]]
with open("data/walker_data.csv", newline="") as faw_file:
    reader = csv.reader(faw_file, delimiter=',')
    faw_table = [
        [int(x) for x in row] for row in reader
    ]
"""
location = "vinhyen"
cur_age = 8
content_type = 'csv'
base_url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'
api_key = '6PPSTB388F7H536HMUZRHXPS8'
include = "days"
end_date = str(datetime.date.today() + datetime.timedelta(14))
# end_date = str('2020-12-01')
unit_group = 'metric'

open_weather_url = "https://pro.openweathermap.org/data/2.5/forecast/climate?"
api_open_weather_key = "5b24e25f4c0ddc81a6c4f676995a4c85"
forecast_data = None

DEVELOPEMENT_STAGE = [
    'egg', 'instar_1', 'instar_2', 'instar_3', 'instar_4', 'pupal', 'adult'
]
NUM_STAGE = 6
BASE_TEMPURATURE = 20

faw_table = [[], []]

# def create_faw_table():
    # for i in range(0, NUM_STAGE):
    #     x, y = regression_table.a_parameter[i], regression_table.b_parameter[i]
    #     faw_table[0].append(int(-y / x))
    #     faw_table[1].append(int((BASE_TEMPURATURE - faw_table[0][i]) / (x * BASE_TEMPURATURE + y)))
    #     if i > 0 and i < NUM_STAGE - 1: 
    #         faw_table[1][i] += faw_table[1][i - 1]


def convert_str_to_time(query_time):
    arr = query_time.split('-')
    return date(int(arr[0]), int(arr[1]), int(arr[2]))

def get_tempurature(query_time):
    if(query_time > date.today() and int((query_time - date.today()).days) >= 14):
        print("Out of data range")
        sys.exit()
    else:
        try:
            day_index = weather_table[weather_table['datetime'] == str(query_time)].index.values[0]
        except IndexError:
            print("Out of data range")
            exit()
        temp = int(float(weather_table.temp[day_index]))
        return temp
    
class FAWPrediction():
    
    def __init__(self, cur_time: str, cur_age: int):
        self.cur_time = cur_time
        self.cur_age = cur_age
        tmp = cur_time.split('-')
        self.cur_date = date(int(tmp[0]), int(tmp[1]), int(tmp[2]))
        return
    
    def calculate_mode_lookup(self):
        age = self.cur_age
        cur_k = 0
        dev_time = 0
        dev_day = self.cur_date

        if(age == NUM_STAGE):
            age = 0
            dev_time = 3
            dev_day = dev_day + datetime.timedelta(dev_time)
            if(str(dev_day) > end_date):
                print("Time is over")
                sys.exit()
            cur_k = max(get_tempurature(dev_day) - faw_table[0][0], 0)
            print(DEVELOPEMENT_STAGE[0], (dev_day))

        if (age > 0): 
            tmp_var = faw_table[1][age - 1]
            for i in range(NUM_STAGE - 1, -1, -1):
                faw_table[1][i] = max(faw_table[1][i] - tmp_var, 0)

        dev_time = 1

        while (age < NUM_STAGE):
            dev_day = dev_day + datetime.timedelta(dev_time)
            temp = get_tempurature(dev_day)
            cur_k += max(temp - faw_table[0][age], 0)
            if(cur_k > faw_table[1][age]):
                temp_day = dev_day + datetime.timedelta(dev_time)
                print(DEVELOPEMENT_STAGE[age + 1], temp_day)
                age = age + 1
        return
    
    def calculate_mode_regression(self):
        
        def calculate_dev_time(stage: int, temp: int):
            x, y =  regression_table.a_parameter[stage], regression_table.b_parameter[stage]
            ans = math.ceil(1 / (x*temp+y))
            if(stage != NUM_STAGE - 1): 
                return ans
            else:        
                sub = 0
                for i in range(0, NUM_STAGE - 1):
                    x, y =  regression_table.a_parameter[i], regression_table.b_parameter[i]
                    sub += math.ceil(1 / (x*temp+y))
                ans -= sub
                return ans
        
        dev_time = 3
        age = self.cur_age
        cnt = 0
        dev_day = self.cur_date
        if(age == NUM_STAGE):
            dev_day += datetime.timedelta(dev_time)
            print(DEVELOPEMENT_STAGE[0], dev_day)
            age = 0
        for i in range(age, NUM_STAGE):
            dev_time = calculate_dev_time(i, get_tempurature(dev_day))
            dev_day += datetime.timedelta(dev_time)
            print(DEVELOPEMENT_STAGE[i + 1], dev_day)
        return    


if __name__ == "__main__":
    # create_faw_table()

    with open("data/walker.csv", newline="") as faw_file:
        reader = csv.reader(faw_file, delimiter=',')
        faw_table = [[int(x) for x in row] for row in reader][1:]
    

    location = "Hanoi"
    start_date = date.today()
    cal_mode = "lookup"
    cur_age = 0

    for i in range(len(sys.argv)):
        if(sys.argv[i] == "--mode"): cal_mode = sys.argv[i + 1]
        if(sys.argv[i] == "--location"): location = sys.argv[i + 1]
        if(sys.argv[i] == "--date"): start_date = sys.argv[i + 1]
        if(sys.argv[i] == "--age"): 
            cur_age = 0
            tmp = sys.argv[i + 1].split(',')
            if(len(tmp) == 1):
                cur_age = int(tmp[0])
                break
            age_arr = []
            for age in tmp:
                age_tmp = age.split(':')
                if(len(age_tmp) != 2):
                    print("Wrong format distribution")
                    sys.exit()
                age_arr.append((int(age_tmp[0]), float(age_tmp[1])))
            
            max_distribution = 0
            for i in range(len(age_arr)):
                if(max_distribution > age_arr[i][1]):
                    cur_age = age_arr[i][0]
    weather_table_api = visualAPI(base_url, api_key, location, start_date, end_date, unit_group, content_type, include)
    weather_table_api.create_api()
    weather_table = weather_table_api.run_api()
    # weather_table = pd.read_csv("data/weather_data.csv")
    
    # forecast_data = geocodingAPI(open_weather_url, api_open_weather_key, location)
    # forecast_data.create_api()
    # forecast_data.load_api()
    
    calculate = FAWPrediction(start_date, cur_age)
    if (cal_mode == "regression"):
        calculate.calculate_mode_regression()
    else:
        calculate.calculate_mode_lookup()
