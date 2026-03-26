// auth
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) window.location.href = "login.html";

// current values
const usernameInput = document.getElementById("username");
const aboutInput    = document.getElementById("aboutyou-edit");
const genderSelect  = document.getElementById("gender");
const picInput      = document.getElementById("profile-pic");

// placeholders / current values
if (usernameInput) usernameInput.placeholder = currentUser.username || "";
if (aboutInput)    aboutInput.value          = currentUser.bio      || "";
if (genderSelect && currentUser.gender) genderSelect.value = currentUser.gender;

// submit
const form = document.querySelector(".edit-profile-form");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    const newBio      = aboutInput.value.trim();
    const newGender   = genderSelect.value;
    // username can only be updated when user types
    if (newUsername && newUsername !== currentUser.username) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const taken = users.find(u => u.username === newUsername && u.id !== currentUser.id);
        if (taken) {
            alert("That username is already taken.");
            return;
        }
        // update username in users posts
        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.forEach(p => { if (p.user === currentUser.username) p.user = newUsername; });
        localStorage.setItem("posts", JSON.stringify(posts));
        currentUser.username = newUsername;
    }

    // bio & gender
    currentUser.bio    = newBio;
    currentUser.gender = newGender;
    //pfp
    const file = picInput && picInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentUser.profilePicture = ev.target.result;
            localStorage.setItem("userProfilePic", ev.target.result);
            saveAndRedirect();
        };
        reader.readAsDataURL(file);
    } else {
        saveAndRedirect();
    }
});

function saveAndRedirect() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx   = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) users[idx] = currentUser;
    localStorage.setItem("users",        JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));

    window.location.href = "user-profile.html";
}