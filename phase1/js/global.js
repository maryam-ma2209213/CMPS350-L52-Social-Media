// global.js — fixed
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

// prevent unauthorized access
if (!currentUser) {
    window.location.href = "login.html";
}

// BUG FIX: logout modal was nested inside the click handler, so inner listeners
// were re-added every click and never fired on the first click.
// Moved all listener setup to top level.
const logoutBtn     = document.querySelector("#logout-btn");
const modal         = document.querySelector("#logout-confirm");
const confirmLogout = document.querySelector("#confirm-logout");
const cancelLogout  = document.querySelector("#cancel-logout");

if (logoutBtn && modal) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("hidden");
    });
}

if (cancelLogout) {
    cancelLogout.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}

if (confirmLogout) {
    confirmLogout.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    });
}