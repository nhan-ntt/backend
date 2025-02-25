import codecs
import csv
import sys
import urllib.error
import urllib.request

import pandas

from api.openAPI import openAPI


class visualAPI(openAPI):
    def __init__(self, api_key, location, start_date, end_date):
        super().__init__(api_key)
        self.base_url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.unit_group = 'metric'
        self.content_group = 'csv'
        self.include = 'days'
        self.api_query = None

    def create_api(self):
        self.api_query = self.base_url + self.location
        if len(self.start_date):
            self.api_query += "/" + self.start_date
            if len(self.end_date):
                self.api_query += "/" + self.end_date
        self.api_query += "?"
        if len(self.unit_group):
            self.api_query += "&unitGroup=" + self.unit_group
        if len(self.content_group):
            self.api_query += "&contentType=" + self.content_group
        if len(self.include):
            self.api_query += '&include=' + self.include
        self.api_query += "&key=" + self.api_key

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
        if len(CSVText.datetime) == 0:
            print("Can't process now! Failed to load CSV")
            sys.exit()
        return CSVText

    def export_to_csv(self, file_name):
        self.run_api().to_csv(file_name, index=False)
        # print(f"Successfully exported to '{file_name}'")
