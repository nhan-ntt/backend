import datetime
import math
import sys
from datetime import date
from types import NoneType

from utils import get_temperature, faw_table, NUM_STAGE, end_date, DEVELOPMENT_STAGE, regression_table


class FAWPredict:

    def __init__(self, cur_date: str, cur_age: int):
        self.cur_age = cur_age
        if isinstance(cur_date, datetime.date):
            cur_date = cur_date.strftime('%Y-%m-%d')

        tmp_date = cur_date.split('-')
        self.cur_date = date(int(tmp_date[0]), int(tmp_date[1]), int(tmp_date[2]))
        return

    def calculate_mode_lookup(self):
        age = self.cur_age
        cur_k = 0
        dev_day = self.cur_date

        if age == NUM_STAGE:
            age = 0
            dev_time = 3  # developing time
            dev_day = dev_day + datetime.timedelta(dev_time)

            if str(dev_day) > end_date:
                print("Time is over")
                sys.exit()

            try:
                cur_k = get_temperature(dev_day) - faw_table[0][0]
            except ValueError as e:
                print(e)
                sys.exit()
            print(DEVELOPMENT_STAGE[0], dev_day)

        dev_time = 1
        while age < NUM_STAGE:
            dev_day += datetime.timedelta(dev_time)
            try:
                if type(get_temperature(dev_day)) == NoneType:
                    print("Out of data range")
                    sys.exit()
                temp = get_temperature(dev_day)
            except ValueError as e:
                print(e)
                sys.exit()
            cur_k += float(temp) - faw_table[0][age]
            if cur_k > faw_table[1][age]:
                temp_day = dev_day + datetime.timedelta(dev_time)
                print(DEVELOPMENT_STAGE[age + 1], temp_day)
                age = age + 1
        return

    def calculate_mode_regression(self):

        def calculate_dev_time(stage: int, temp: float):
            a, b = regression_table.a_parameter[stage], regression_table.b_parameter[stage]
            dev_time = math.ceil(1 / (a * temp + b))
            if stage != NUM_STAGE - 1:
                return dev_time
            else:
                sub = 0
                for stage in range(0, NUM_STAGE - 1):
                    a, b = regression_table.a_parameter[stage], regression_table.b_parameter[stage]
                    sub += math.ceil(1 / (a * temp + b))
                dev_time -= sub
                return dev_time

        dev_time = 3
        age = self.cur_age
        dev_day = self.cur_date
        if age == NUM_STAGE:
            dev_day += datetime.timedelta(dev_time)
            print(DEVELOPMENT_STAGE[0], dev_day)
            age = 0
        for i in range(age, NUM_STAGE):
            if str(dev_day) > end_date:
                print("Time is over")
                sys.exit()
            temp = float(get_temperature(str(dev_day)))
            dev_time = calculate_dev_time(i, temp)
            dev_day += datetime.timedelta(dev_time)
            print(DEVELOPMENT_STAGE[i + 1], dev_day)
        return
