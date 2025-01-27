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

# Actual code
import random
pastIDs = []
lastRow = len(worksheet.get_all_values()) + 1
for i in range(344, lastRow):
    random_number = random.randint(100000, 999999)
    while random_number in pastIDs:
        random_number = random.randint(100000, 999999)
    pastIDs.append(random_number)
    worksheet.update("E" + str(i), [[random_number]])