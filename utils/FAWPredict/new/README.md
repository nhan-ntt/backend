# FAWPredict

Fall-army-worm predict repo

## Setup

1. Clone repo
2. `cd FAWpredict`
3. `pip install -r requirements.txt`

## How to runs

Open the terminal and type
  
    python main.py --mode [SELECT_MODE] --location [SELECT_LOCATION] --date [SELECT_DATE] --age [SELECT_AGE]
    
- [SELECT_MODE]: `regression` mode or `lookup` mode
- [SELECT_LOCATION]: location to analyze # default: Hanoi
- [SELECT_DATE]: format: yyyy-mm-dd (Example: 2022-04-01) # default: today
- [SELECT_AGE]: a number from 0-8 represent for development stages of worm # distribution format: 2:0.5,3:0.3,4:0.2
```   
0: egg
1: first instar
2: second instar
3: third instar
4: fourth instar
5: fifth instar
6: sixth instar
7: pupal stage
8: adult stage
```
