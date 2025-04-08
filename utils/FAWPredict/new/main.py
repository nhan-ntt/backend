import sys
from datetime import date

from FAWPredict import FAWPredict

if __name__ == "__main__":

    location = "Hanoi"
    start_date = date.today()
    cal_mode = "lookup"
    cur_age = 0
    for i in range(len(sys.argv)):
        if sys.argv[i] == "--mode":
            cal_mode = sys.argv[i + 1]
        if sys.argv[i] == "--location":
            location = sys.argv[i + 1]
        if sys.argv[i] == "--date":
            start_date = sys.argv[i + 1]


        # -–age 2:0.5,3:0.3,4:0.2

        if sys.argv[i] == "--age":
            cur_age = 0
            tmp = sys.argv[i + 1].split(',')
            if len(tmp) == 1:
                cur_age = int(tmp[0])
                break
            age_arr = []
            for age in tmp:
                age_tmp = age.split(':')
                if (len(age_tmp) != 2):
                    print("Wrong format distribution")
                    sys.exit()
                age_arr.append((int(age_tmp[0]), float(age_tmp[1])))

            max_distribution = 0
            for i in range(len(age_arr)):
                if max_distribution < age_arr[i][1]:
                    max_distribution = age_arr[i][1]
                    cur_age = age_arr[i][0]

    calculate = FAWPredict(start_date, cur_age)

    if cal_mode == 'regression':
        calculate.calculate_mode_regression()
    else:
        calculate.calculate_mode_lookup()
