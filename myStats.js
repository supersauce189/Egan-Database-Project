const form = document.querySelector("form");
const wrapper = document.querySelector(".wrapper");
const nameInput = document.getElementById("name-input");
const passwordInput = document.getElementById("password-input");
const errorText = document.getElementById("error-message");
const nameHeader = document.getElementById("nameHeader");

// Making error (Red input box) disappears after user types something
const allInputs = [nameInput, passwordInput];
allInputs.forEach(input => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      errorText.innerText = "";
    }
  })
})

// Grabbing data
var dict;
async function fetchData() {
  await fetch("Database Files/db.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      dict = data;
      console.log("Data Grabbed");
    })
    .catch(error => {
      console.error("Error: " + error);
    })
}

var name;

var accounts;
async function fetchAccounts() {
  await fetch("Database Files/collectionsAccounts.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      accounts = data["accounts"];
      console.log("Accounts Fetched");
    })
    .catch(error => {
      console.error("Error: " + error);
    })
}
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    // Pulling information
    await fetchData();
    await fetchAccounts();
    // Checking that both inputs are filled out
    var isValid = true;
    name = nameInput.value.trim();
    name = name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    if (name === "" || name === null) {
      nameInput.parentElement.classList.add("incorrect");
      errorText.innerText = "Please fill out both fields!";
      isValid = false;
    }
    if (passwordInput.value === "" || passwordInput.value === null) {
      passwordInput.parentElement.classList.add("incorrect");
      errorText.innerText = "Please fill out both fields!";
      isValid = false;
    }
    if (!isValid) {
      return;
    }
    // Checking if name exists
    if (dict[name] === undefined) {
      nameInput.parentElement.classList.add("incorrect");
      errorText.innerText = "Name not found!";
      return;
      // Check if Password is Correct
    } else if (accounts[name] !== passwordInput.value) {
      passwordInput.parentElement.classList.add("incorrect");
      errorText.innerText = "Incorrect password!";
      return;
    }
    // Hiding login form
    wrapper.style.display = "none";
    // Showing stats
    const actual = document.getElementById("actualContent");
    actual.style.display = "block";
    // Show stats by pulling information from the json files
    showStats("1-Lap");
})
const navLinks = document.querySelectorAll(".navbar a");
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(nav => nav.classList.remove("active"));
    link.classList.add("active");
    showStats(link.dataset.text);
  })
})

var myLineChart;
async function showStats(type) {
  await fetchData();
  // Resetting displays of elements
  var table = document.querySelector("table");
  var flex = document.querySelector(".flex");
  var noInfoHeading = document.getElementById("noInfo");
  table.style.display = "table";
  flex.style.display = "flex";
  noInfoHeading.style.display = "none";
  // Writing name to header
  nameHeader.innerText = name;
  // Writing to the textbox on the right
  var person = dict[name];
  var exists = person["Fastest " + type + " Time"][1] !== undefined;
  // Checking if user has ran this event before
  if (!exists) {
    table.style.display = "none";
    flex.style.display = "none";
    noInfoHeading.style.display = "block";
    return;
  }
  var fastestTime = toReadable(person["Fastest " + type + " Time"][1]);
  var fastestTimeDate = person["Fastest " + type + " Time"][0];
  var fastestTimeRanking;
  var fastestJson;
  await fetch("Database Files/" + type + "_Fastest.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      fastestJson = data;
      console.log("Fastest json grabbed");
    })
    .catch(error => {
      console.error("Error: " + error);
    })
  Object.keys(fastestJson).forEach((key, index) => {
    if (key === name) {
      fastestTimeRanking = index + 1;
    }
  })
  var averageTime = toReadable(person["Average " + type + " Time"]);
  var averageTimeRanking;
  var averageJson;
  await fetch("Database Files/" + type + "_Average.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      averageJson = data;
      console.log("Average json grabbed");
    })
    .catch(error => {
      console.error("Error: " + error);
    })
  Object.keys(averageJson).forEach((key, index) => {
    if (key === name) {
      averageTimeRanking = index + 1;
    }
  })
  var mostRecent;
  var mostRecentDate;
  var allRuns = person["All Runs"];
  for (let i = allRuns.length - 1; i >= 0; i--) {
    let current = allRuns[i];
    if (current[0].split(" ")[1] === type) {
      mostRecent = toReadable(current[1]);
      mostRecentDate = current[0].split(" ")[0];
      break;
    }
  }
  document.getElementById("fastest").innerHTML = "<strong>Fastest Time (" + fastestTimeDate + "): </strong>" + fastestTime + " (School Ranking: #" + fastestTimeRanking + ")";
  document.getElementById("average").innerHTML = "<strong>Average Time: </strong>" + averageTime + " (School Ranking: #" + averageTimeRanking + ")";
  document.getElementById("recent").innerHTML = "<strong>Most Recent Time (" + mostRecentDate + "): </strong>" + mostRecent;
  document.getElementById("totalLaps").innerHTML = "<strong>Total Laps: </strong>" + person["Total Laps"];
  // Writing to the ranking cards
  var grade = person["Grade"];
  var period = person["Period"];
  var teacher = person["Teacher"];
  var gender = person["Gender"];

  var fastestClassJson = JSON.parse(JSON.stringify(fastestJson));
  var averageClassJson = JSON.parse(JSON.stringify(averageJson));
  var fastestGradeGenderJson = JSON.parse(JSON.stringify(fastestJson));
  var averageGradeGenderJson = JSON.parse(JSON.stringify(averageJson));
  fastestClassJson = Object.fromEntries(
    Object.entries(fastestClassJson).filter(([key, value]) => value.Period === period && value.Teacher === teacher && value.Grade === grade)
  );
  averageClassJson = Object.fromEntries(
    Object.entries(averageClassJson).filter(([key, value]) => value.Period === period && value.Teacher === teacher && value.Grade === grade)
  );
  fastestGradeGenderJson = Object.fromEntries(
    Object.entries(fastestGradeGenderJson).filter(([key, value]) => value.Gender === gender && value.Grade === grade)
  );
  averageGradeGenderJson = Object.fromEntries(
    Object.entries(averageGradeGenderJson).filter(([key, value]) => value.Gender === gender && value.Grade === grade)
  );

  var fastestClassRanking;
  var averageClassRanking;
  var fastestGradeGenderRanking;
  var averageGradeGenderRanking;

  Object.keys(fastestClassJson).forEach((key, index) => {
    if (key === name) {
      fastestClassRanking = index + 1;
    }
  })
  Object.keys(averageClassJson).forEach((key, index) => {
    if (key === name) {
      averageClassRanking = index + 1;
    }
  })
  Object.keys(fastestGradeGenderJson).forEach((key, index) => {
    if (key === name) {
      fastestGradeGenderRanking = index + 1;
    }
  })
  Object.keys(averageGradeGenderJson).forEach((key, index) => {
    if (key === name) {
      averageGradeGenderRanking = index + 1;
    }
  })

  var genderGradeText = grade + "th grade " + (gender === "Male" ? "Boys" : gender === "Girl" ? "Girls" : Other)
  document.getElementById("fastestClassIcon").innerText = "#" + fastestClassRanking;
  document.getElementById("fastestGenderGrade").innerText = genderGradeText;
  document.getElementById("fastestGenderGradeIcon").innerText = "#" + fastestGradeGenderRanking;
  document.getElementById("averageClassIcon").innerText = "#" + averageClassRanking;
  document.getElementById("averageGenderGrade").innerText = genderGradeText;
  document.getElementById("averageGenderGradeIcon").innerText = "#" + averageGradeGenderRanking;
  // Writing to the table
  var tableDates = [];
  var tableTimes = [];
  var changes = [];
  var notes = [];
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  for (let i = 0; i < allRuns.length; i++) {
    let current = allRuns[i];
    if (current[0].split(" ")[1] === type) {
      tableDates.push(current[0].split(" ")[0]);
      tableTimes.push(current[1]);
      if (tableDates.length > 1) {
        var change = tableTimes[tableTimes.length - 1] - tableTimes[tableTimes.length - 2];
        if (change > 0) {
          changes.push("+" + change);
        } else {
          changes.push(change);
        }
      }
    }
  }
  let pastTimes = [];
  for (let i = 0; i < allRuns.length; i++) {
    let current = allRuns[i];
    let currNotes = [];
    if (current[0].split(" ")[1] === type) {
      pastTimes.push(current[1]);
      // Checking for first run
      if (pastTimes.length === 1) {
        currNotes.push("First Recorded Time!");
        notes.push(currNotes);
        continue;
      }
      // Checking for new record
      let isRecord = true;
      for (let j = 0; j < pastTimes.length - 1; j++) {
        if (current[1] > pastTimes[j]) {
          isRecord = false;
          break;
        }
      }
      if (isRecord) {
        currNotes.push("New Record!");
      }
      if (currNotes.length === 0) {
        currNotes.push("...");
      }
      notes.push(currNotes);
    }
  }
  for (let i = tableDates.length - 1; i >= 0; i--) {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    dateCell.innerText = tableDates[i];
    const timeCell = document.createElement("td");
    timeCell.innerText = toReadable(tableTimes[i]);
    const changeCell = document.createElement("td");
    if (i !== 0) {
      changeCell.innerText = changes[i - 1];
    } else {
      changeCell.innerText = "...";
    }
    const noteCell = document.createElement("td");
    noteCell.innerText = notes[i];
    console.log("Current notes: " + notes[i]);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(changeCell);
    row.appendChild(noteCell);
    tbody.appendChild(row);
  }
  // X-axis and Y-axis data points
  var dates = [];
  var times = [];
  for (let i = 0; i < allRuns.length; i++) {
    let current = allRuns[i];
    if (current[0].split(" ")[1] === type) {
      dates.push(current[0].split(" ")[0]);
      times.push(current[1]);
    }
  }
  // Initialize the chart
  const ctx = document.getElementById('myChart').getContext('2d');

  const data = {
    labels: dates, // X-axis labels
    datasets: [
        {
          label: type + ' Progression', // Chart label
          data: times, // Y-axis data points
          borderColor: 'blue', // Line color
          backgroundColor: 'blue', // Point color
          borderWidth: 2, // Thickness of the line
          pointRadius: 5, // Size of the points
          pointHoverRadius: 7, // Size of points on hover
          fill: false, // No area under the line
        },
    ],
  };

  const config = {
    type: 'line', // Chart type
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
              display: true, // Show the chart legend
          },
        },
        scales: {
          x: {
              title: {
                display: true,
                text: 'Dates', // X-axis label
              },
          },
          y: {
              title: {
                display: true,
                text: 'Times (Seconds)', // Y-axis label
              },
              beginAtZero: true, // Start the Y-axis from zero
          },
        },
    },
  };
  if (myLineChart) {
    myLineChart.destroy();
    const canvas = document.getElementById('myChart');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  myLineChart = new Chart(ctx, config);
}

function toReadable(seconds) {
  var minutes = Math.floor(seconds / 60);
  var seconds = Math.floor(seconds - minutes * 60);
  var timeString = (minutes > 0 ? (minutes + ":") : "00:") + (seconds >= 10 ? (seconds) : seconds > 0 ? "0" + seconds : "00");
  return timeString;
}