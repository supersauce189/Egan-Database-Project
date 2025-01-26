// Phone Dropdown Menu
document.querySelector('#dropdown-trigger').addEventListener('click', () => {
  document.querySelector("form").classList.toggle('open');
});
// Editing first table heading on phone screen
const first = document.querySelector("thead tr th");
first.innerText = "Rank";
// Changing leaderboard on dropdown change
const dropdowns = document.querySelectorAll("select");
dropdowns.forEach(dropdown => {
    dropdown.addEventListener("change", editLeaderboard)
})
editLeaderboard();
// Function to change leaderboard
async function editLeaderboard() {
    var heading = document.getElementById("heading");
    var typeDrop = document.getElementById("leaderboard");
    var selectedText = typeDrop.options[typeDrop.selectedIndex].text;
    var table = document.querySelector("tbody");
    const fullTable = document.querySelector("table");
    heading.innerText = selectedText + "s";
    // Resetting the leaderboard
    table.innerHTML = "";
    fullTable.style.display = "table";
    // Grabbing the correct file
    var dropdownSplitted = selectedText.split(" ");
    var fileName = "Database Files/" + dropdownSplitted[1] + "_" + dropdownSplitted[0] + ".json";
    var leaderboard;
  
    await fetch(fileName)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        leaderboard = data;
        console.log("Leaderboard Fetched");
      })
      .catch(error => {
        console.error("Error: " + error);
      })
    
    // Removing entries based on filter options
    let genderElement = document.getElementById("gender");
    let genderText = genderElement.options[genderElement.selectedIndex].text;
    let gradeElement = document.getElementById("grade");
    let gradeText = gradeElement.options[gradeElement.selectedIndex].text;
    let periodElement = document.getElementById("period");
    let periodText = periodElement.options[periodElement.selectedIndex].text;
    let teacherElement =  document.getElementById("teacher");
    let teacherText = teacherElement.options[teacherElement.selectedIndex].text;
    
    // Filter elements
    console.log(leaderboard);
    var entries = Object.entries(leaderboard);
    var filteredEntries = entries.filter((entry) => (genderText === "Select an option" || entry[1]["Gender"] === genderText) && (gradeText === "Select an option" || entry[1][2] === gradeText) && (periodText === "Select an option" || entry[1][3] === periodText) && (teacherText === "Select an option" || entry[1][4] === teacherText));
    // Check if dictionary is blank
    if (filteredEntries.length === 0) {
      heading.innerText = "No people found";
      table.innerHTML = "";
      
      fullTable.style.display = "none";
      return;
    }
  
    var first15 = filteredEntries.slice(0, 15);
  
    let i = 0;
    // Adding / removing date column based on Average / Fastest
    var isDate = dropdownSplitted[0] === "Fastest";
    if (document.getElementById("date") === null) {
      const thead = document.querySelector("thead tr");
      let dateHead = document.createElement("th");
      dateHead.innerText = "Date";
      dateHead.id = "date";
      thead.appendChild(dateHead);
      console.log("Date added!");
    }
    if (!isDate) {
      var dateHeading = document.getElementById("date");
      dateHeading.remove();
    }
    filteredEntries.forEach((currentValue) => {
      // Skipping people with 0 in the value
      var cleaned;
      if ((selectedText.split(" "))[0] === "Fastest") {
        cleaned = [currentValue[0], currentValue[1][selectedText][1], currentValue[1][selectedText][0]];
      } else if (selectedText.split(" ")[0] === "Average") {
        cleaned = [currentValue[0], currentValue[1][selectedText]];
      }
      console.log("Cleaned: " + cleaned);
      // Converting time
      var minutes = Math.floor(cleaned[1] / 60);
      var seconds = cleaned[1] - minutes * 60;
      cleaned[1] = (minutes > 0 ? (minutes + ":") : "00:") + (seconds > 0 ? (seconds) : "00");
      // Adding to the leaderboard
      const newRow = document.createElement("tr");
      const rankCell = document.createElement("td");
      rankCell.innerText = i + 1;
      const nameCell = document.createElement("td");
      nameCell.innerText = cleaned[0];
      const timeCell = document.createElement("td");
      timeCell.innerText = cleaned[1];
      newRow.appendChild(rankCell);
      newRow.appendChild(nameCell);
      newRow.appendChild(timeCell);
      if (isDate) {
        const dateCell = document.createElement("td");
        dateCell.innerText = cleaned[2];
        newRow.appendChild(dateCell);
      }
      table.appendChild(newRow);
      
      i++;
    })
}