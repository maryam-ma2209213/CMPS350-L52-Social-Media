// auth 
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) {
    window.location.href = "login.html";
}

// profile info
const profilePic   = document.getElementById("profile-picture");
const profileInput = document.getElementById("selectedPfp");
const usernameH3   = document.getElementById("username-h3");
const aboutYou     = document.getElementById("about-you");

// adding username and bio
if (usernameH3) usernameH3.textContent = currentUser.username || "Username";
if (aboutYou)   aboutYou.textContent   = currentUser.bio      || "No bio yet.";

// prof pic
const savedPfp = localStorage.getItem("userProfilePic");
if (savedPfp && profilePic) profilePic.src = savedPfp;

// can also click pfp to change it
if (profilePic && profileInput) {
    profilePic.addEventListener("click", () => profileInput.click());

    profileInput.addEventListener("change", () => {
        const file = profileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePic.src = e.target.result;
            localStorage.setItem("userProfilePic", e.target.result);

            currentUser.profilePicture = e.target.result;
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const idx   = users.findIndex(u => u.id === currentUser.id);
            if (idx !== -1) users[idx] = currentUser;
            localStorage.setItem("users",         JSON.stringify(users));
            localStorage.setItem("loggedInUser",  JSON.stringify(currentUser));
        };
        reader.readAsDataURL(file);
    });
}

// post grid
const postsGrid = document.querySelector(".user-posts-div");

// only posts belonging to the logged-in user filtered
const allPosts   = JSON.parse(localStorage.getItem("posts")) || [];
const userPosts  = allPosts.filter(p => p.user === currentUser.username);

// post count update
const postCountEl = document.querySelector(".posts-followers-following p:first-child");
if (postCountEl) postCountEl.textContent = `${userPosts.length} posts`;

// clear any hardcoded HTML (will not be needed after we remove testing media!)
if (postsGrid) {
    postsGrid.innerHTML = "";

    if (userPosts.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No posts yet. Share something!";
        empty.style.cssText = "grid-column:1/-1; text-align:center; opacity:.6; padding:2rem;";
        postsGrid.appendChild(empty);
    } else {
        userPosts.forEach(post => {
            const likes    = getLikes(post.id);
            const comments = getComments(post.id);

            const div = document.createElement("div");
            div.classList.add("post");

            div.innerHTML = `
                ${post.image
                    ? `<img src="${post.image}" alt="post image">`
                    : `<div class="post-text-only">${post.text || ""}</div>`}
                <div class="post-overlay">
                    <span class="overlay-stat"><span>🤍</span> ${likes}</span>
                    <span class="overlay-stat"><span>💬</span> ${comments}</span>
                </div>
            `;

            postsGrid.appendChild(div);
        });
    }
}

// helpers: read like & comment counts from localStorage
function getLikes(postId) {
    const likedBy = JSON.parse(localStorage.getItem(`likes_${postId}`)) || [];
    return likedBy.length;
}

function getComments(postId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    return comments.length;
}