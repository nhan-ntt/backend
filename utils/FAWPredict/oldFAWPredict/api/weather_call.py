from email import contentmanager
import typing
import csv
import requests
import json
import codecs
import urllib.request
import urllib.error
import pandas
import sys
import datetime

class openAPI():
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        self.api_query = ""
        self.information = {}
    def create_api(self):
        return
    def load_api(self):
        return
class geocodingAPI(openAPI):
    def __init__(self, base_url, api_key, location):
        super().__init__(base_url, api_key)
        self.location = location
    def create_api(self):
        self.api_query = self.base_url + "q=" + self.location + "&appid=" + self.api_key + "&cnt=30&units=metric"
    def load_api(self):
        response = requests.get(self.api_query)
        self.information = response.json()
    def get_lat(self):
        return self.information["city"]["coord"]["lat"]
    def get_lon(self):
        return self.information["city"]["coord"]["lon"]
    def get_tempurature(self, date_query):
        delta = int((date_query - datetime.date.today()).days)
        try:
            value = int(self.information["list"][delta]["temp"]["day"]) 
            return value
        except KeyError:        
            print("Out of data range")
            exit()
        
class visualAPI():    
    def __init__(self, BASE_URL, API_KEY, LOCATION, START_DATE, END_DATE, UNIT_GROUP, CONTENT_GROUP, INCLUDE):
        self.base_url = BASE_URL
        self.api_key = API_KEY
        self.location = LOCATION
        self.start_date = START_DATE
        self.end_date = END_DATE
        self.unit_group = UNIT_GROUP
        self.content_group = CONTENT_GROUP
        self.include = INCLUDE
        self.api_query = str()
        
    def create_api(self):
        self.api_query = self.base_url + self.location
        if(len(self.start_date)):
            self.api_query += "/" + self.start_date
            if(len(self.end_date)):
                self.api_query += "/" + self.end_date
        self.api_query += "?"
        if(len(self.unit_group)):
            self.api_query += "&unitGroup=" + self.unit_group
        if(len(self.content_group)):
            self.api_query += "&contentType=" + self.content_group
        if(len(self.include)):
            self.api_query += '&include='+self.include
        self.api_query += "&key="+self.api_key
    
    def run_api(self):
        try:
            CSV_Bytes = urllib.request.urlopen(self.api_query)
        except urllib.error.HTTPError as e:
            print("Can't process now! Failed load query")
            sys.exit()
        except urllib.error.URLError as e:
            print("Can't process now! Failed load query")
            sys.exit()
        
        CSVText = pandas.DataFrame(csv.DictReader(codecs.iterdecode(CSV_Bytes, 'utf-8'), delimiter=','))
        if(len(CSVText.datetime) == 0): 
            print("Can't process now! Failed to load CSV")
            sys.exit()
        return CSVText