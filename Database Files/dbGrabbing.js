// Firebase Initialization
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// File Writing Initialization
import { writeFile, readFile } from 'fs/promises';

// Variables
var g7 = ["Troyer P1", "Troyer P2", "Troyer P4"];
var g8 = ["Huynh P1", "Huynh P4", "Huynh P6", "Huynh P7", "Valencia P1", "Valencia P2", "Valencia P3", "Valencia P5", "Valencia P6"];
var collectionList;
var dbData = {};

async function fetchCollection() {
  try {
    // Read the JSON file
    const data = await readFile("Database Files/collectionsAccounts.json", "utf8");
    collectionList = JSON.parse(data)["collections"]; // Parse the JSON
    console.log("Collections Fetched");
  } catch (error) {
    console.error("Error reading the JSON file:", error);
  }
}

function clean(arr) {
  var jsonObject = arr.reduce((acc, curr) => {
    const [key, value] = Object.entries(curr)[0];
    acc[key] = value;
    return acc;
  }, {})
  let result = "{\n";
  const entries = Object.entries(jsonObject);

  entries.forEach(([key, value], index) => {
    result += `  "${key}":`;

    if (typeof value === "object" && !Array.isArray(value)) {
      // Keep nested objects compact
      result += JSON.stringify(value);
    } else if (Array.isArray(value)) {
      // Keep arrays compact
      result += `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    } else {
      // Add primitive values
      result += JSON.stringify(value);
    }

    if (index < entries.length - 1) result += ",";
    result += "\n";
  });
  result += "}";
  result = result.replace(/:/g, ": ");
  result = result.replace(/,/g, ", ");
  return result;
}

async function writeDB() {
  await fetchCollection();

  if (!collectionList || collectionList.length === 0) {
    console.error("Collection list is empty or undefined. Make sure the fetchCollection function works correctly.");
    return;
  }

  const promises = collectionList.map(async (element) => {
    // Finding grade level
    var grade;
    var splitted = element.split(" ");
    var last2 = splitted.slice(-2).join(" ");
    if (g8.includes(last2)) {
      grade = "8";
    } else if (g7.includes(last2)) {
      grade = "7";
    } else {
      console.error("Grade not found");
    }
    const colRef = collection(db, element);
    const querySnapshot = await getDocs(colRef);
    console.log("Collection: " + element);
    querySnapshot.forEach((docSnap) => {
      var idSplitted = docSnap.id.split(" ");
      var name = idSplitted.slice(1).join(" ");
      var time = parseInt(docSnap.data().t);
      if (Object.keys(dbData).includes(name)) {
        let date = splitted[0].replace(/\./g, "/");
        dbData[name]["All Runs"].push([(date + " " + splitted[1]), time]);
        if (dbData[name]["Fastest " + splitted[1] + " Time"] === 0) {
          dbData[name]["Fastest " + splitted[1] + " Time"] = [date, time];
        } else {
          var shouldChange = dbData[name]["Fastest " + splitted[1] + " Time"][1] > time;
          if (shouldChange) {
            dbData[name]["Fastest " + splitted[1] + " Time"] = [date, time];
          }
        }
        if (dbData[name]["Average " + splitted[1] + " Time"] === 0) {
          dbData[name]["Average " + splitted[1] + " Time"] = time;
        } else {
          var runCount = 0;
          var allRuns = dbData[name]["All Runs"];
          for (let i = 0; i < allRuns.length; i++) {
            let current = allRuns[i];
            if (current[0].split(" ")[1] === splitted[1]) {
              runCount += 1;
            }
          }
          dbData[name]["Average " + splitted[1] + " Time"] = (dbData[name]["Average " + splitted[1] + " Time"] * (runCount - 1) + time) / runCount;
        }
        let currLaps;
        if (splitted[1] === "1-Lap") {
          currLaps = 1;
        } else if (splitted[1] === "2-Lap") {
          currLaps = 2;
        } else if (splitted[1] === "Mile") {
          currLaps = 4;
        }
        dbData[name]["Total Laps"] += currLaps;
      } else {
        let date = splitted[0].replace(/\./g, "/");
        dbData[name] = {
          "All Runs": [[(date + " " + splitted[1]), time]],
          "Gender": (idSplitted[0] === "M") ? "Male" : (idSplitted[0] === "F") ? "Female" : "Other",
          "Grade": grade,
          "Period": splitted[3][1],
          "Teacher": splitted[2],
          "Fastest 1-Lap Time": 0,
          "Average 1-Lap Time": 0,
          "Fastest 2-Lap Time": 0,
          "Average 2-Lap Time": 0,
          "Fastest Mile Time": 0,
          "Average Mile Time": 0,
          "Total Laps": 0
        };
        dbData[name]["Fastest " + splitted[1] + " Time"] = [date, time];
        dbData[name]["Average " + splitted[1] + " Time"] = time;
        let currLaps;
        if (splitted[1] === "1-Lap") {
          currLaps = 1;
        } else if (splitted[1] === "2-Lap") {
          currLaps = 2;
        } else if (splitted[1] === "Mile") {
          currLaps = 4;
        }
        dbData[name]["Total Laps"] = currLaps;
      }
    });
  });
  await Promise.all(promises);
  try {
    // Writing the dbData to the files
    const jsonArray = Object.entries(dbData).map(([key, value]) => ({ [key]: value }));
    await writeFile("Database Files/db.json", clean(jsonArray), 'utf8');
    var jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Fastest 1-Lap Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Fastest 1-Lap Time"][1] - b[Object.keys(b)[0]]["Fastest 1-Lap Time"][1]);
    await writeFile("Database Files/1-Lap_Fastest.json", clean(jsonArrayCopy), 'utf8');
    jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Average 1-Lap Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Average 1-Lap Time"] - b[Object.keys(b)[0]]["Average 1-Lap Time"]);
    await writeFile("Database Files/1-Lap_Average.json", clean(jsonArrayCopy), 'utf8');
    jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Fastest 2-Lap Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Fastest 2-Lap Time"][1] - b[Object.keys(b)[0]]["Fastest 2-Lap Time"][1]);
    await writeFile("Database Files/2-Lap_Fastest.json", clean(jsonArrayCopy), 'utf8');
    jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Average 2-Lap Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Average 2-Lap Time"] - b[Object.keys(b)[0]]["Average 2-Lap Time"]);
    await writeFile("Database Files/2-Lap_Average.json", clean(jsonArrayCopy), 'utf8');
    jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Fastest Mile Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Fastest Mile Time"][1] - b[Object.keys(b)[0]]["Fastest Mile Time"][1]);
    await writeFile("Database Files/Mile_Fastest.json", clean(jsonArrayCopy), 'utf8');
    jsonArrayCopy = JSON.parse(JSON.stringify(jsonArray));
    jsonArrayCopy = jsonArrayCopy.filter((element) => {
      let key = Object.keys(element)[0];
      return element[key]["Average Mile Time"] !== 0;
    })
    jsonArrayCopy.sort((a, b) => a[Object.keys(a)[0]]["Average Mile Time"] - b[Object.keys(b)[0]]["Average Mile Time"]);
    await writeFile("Database Files/Mile_Average.json", clean(jsonArrayCopy), 'utf8');
    console.log("File successfully written!");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

writeDB();