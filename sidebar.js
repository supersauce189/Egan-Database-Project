document.getElementById("closeSidebar").addEventListener("click", function(event) {
    event.preventDefault();
    hideSidebar();
});
document.getElementById("openSidebar").addEventListener("click", function(event) {
    event.preventDefault();
    showSidebar();
});
function showSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "flex";
}
function hideSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "none";
}