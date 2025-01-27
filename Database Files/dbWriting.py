# Initialize the Google Sheets API
import gspread
from google.oauth2.service_account import Credentials

scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
]
creds = Credentials.from_service_account_file("Database Files/credentials.json", scopes=scopes)
client = gspread.authorize(creds)

sheet_id = "1_zkNJSaYcjlDMeKyGTmPQOjyVCZTekxHFksQzSkZLFE"
sheet = client.open_by_key(sheet_id)
worksheet = sheet.sheet1

# Setting up Firebase
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("Database Files/firebaseCredentials.json")
default_app = firebase_admin.initialize_app(cred)
db = firestore.client()

# Start actual code
import json
data = {}
data["accounts"] = {}
data["collections"] = []

lastRow = len(worksheet.get_all_values()) + 1
# Cleaning up the first row
firstRow = worksheet.row_values(1)
del firstRow[:6]
for i in range(len(firstRow)):
    date = firstRow[i].split(" ")
    date[0] = date[0].replace("/", ".")
    if (date[1] == "400M"):
        date[1] = "1-Lap"
    elif (date[1] == "800M"):
        date[1] = "2-Lap"
    elif (date[1] == "1600M"):
        date[1] = "Mile"
    firstRow[i] = date[0] + " " + date[1]
allValues = worksheet.get_all_values()
allValues.pop(0)
# Iterating through all rows
for row in allValues:
    print(row)
    data["accounts"][row[3]] = row[4]
    for j in range(len(firstRow)):
        try:
            if (":" not in row[j + 6]):
                print(row[3] + row[j + 6])
                continue
        except:
            continue
        # Getting collection name
        collectionName = firstRow[j]
        if (row[0] == "T"):
            collectionName += " " + "Troyer"
        elif (row[0] == "K"):
            collectionName += " " + "Kesselring"
        elif (row[0] == "V"):
            collectionName += " " + "Valencia"
        elif (row[0] == "Y"):
            collectionName += " " + "Youlee"
        elif (row[0] == "H"):
            collectionName += " " + "Huynh"
        collectionName += " " + "P" + row[2]
        currCollections = data["collections"]
        if (collectionName not in currCollections):
            data["collections"].append(collectionName)
        documentName = row[5] + " " + row[3]
        doc_ref = db.collection(collectionName).document(documentName)
        timeSplitted = row[j + 6].split(":")
        seconds = str(int(timeSplitted[0]) * 60 + int(timeSplitted[1]))
        doc_ref.set({
            "t": seconds
        })
with open("Database Files/collectionsAccounts.json", "w") as json_file:
    json.dump(data, json_file, indent=4)