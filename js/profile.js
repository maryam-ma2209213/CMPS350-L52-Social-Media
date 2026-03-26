// auth
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) window.location.href = "login.html";

// profile header
const profilePic   = document.getElementById("profile-picture");
const profileInput = document.getElementById("selectedPfp");
const usernameHeader   = document.getElementById("username-h3");
const aboutYouEl   = document.getElementById("about-you");

if (usernameHeader) usernameHeader.textContent = currentUser.username || "Username";
if (aboutYouEl) aboutYouEl.textContent = currentUser.bio || "";
const savedPfp = localStorage.getItem("userProfilePic");
if (savedPfp && profilePic) profilePic.src = savedPfp;

// click pfp to change it
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
            localStorage.setItem("users",        JSON.stringify(users));
            localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
        };
        reader.readAsDataURL(file);
    });
}

// posts / followers / following counts
function updateStats() {
    const allPosts  = JSON.parse(localStorage.getItem("posts")) || [];
    const userPosts = allPosts.filter(p => p.user === currentUser.username);
    const allUsers    = JSON.parse(localStorage.getItem("users")) || [];
    const followerCount = allUsers.filter(u => {
        const theirFollowing = JSON.parse(localStorage.getItem(`following_${u.id}`)) || [];
        return theirFollowing.includes(currentUser.username);
    }).length;
    const myFollowing    = JSON.parse(localStorage.getItem(`following_${currentUser.id}`)) || [];
    const followingCount = myFollowing.length;

    const statEls = document.querySelectorAll(".posts-followers-following p");
    if (statEls[0]) statEls[0].textContent = `${userPosts.length} posts`;
    if (statEls[1]) statEls[1].textContent = `${followerCount} followers`;
    if (statEls[2]) statEls[2].textContent = `${followingCount} following`;
}
updateStats();

// initial grid render
renderGrid();

// fully rebuild the grid from localStorage every time
function renderGrid() {
    const postsGrid = document.querySelector(".user-posts-div");
    if (!postsGrid) return;

    const freshPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const mine       = freshPosts.filter(p => p.user === currentUser.username);

    updateStats();

    postsGrid.innerHTML = "";
    if (mine.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No posts yet. Share something!";
        empty.style.cssText = "grid-column:1/-1;text-align:center;opacity:.6;padding:2rem;";
        postsGrid.appendChild(empty);
        return;
    }

    mine.forEach(post => {
        const likes    = (post.likes    || []).length;
        const comments = (post.comments || []).length;
        const div = document.createElement("div");
        div.classList.add("post");
        div.innerHTML = `
            ${post.image
                ? `<img src="${post.image}" alt="post image">`
                : `<div class="post-text-only" style="padding:1rem;font-size:.9rem;color:#555;">${post.text || ""}</div>`}
            <div class="post-overlay">
                <span class="overlay-stat"><span>🤍</span> ${likes}</span>
                <span class="overlay-stat"><span>💬</span> ${comments}</span>
            </div>
        `;
        div.addEventListener("click", () => openModal(post.id));
        postsGrid.appendChild(div);
    });
}

// modal
function openModal(postId) {
    // Always re-read from localStorage so we get fresh data after deletions
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const post  = posts.find(p => p.id == postId);
    if (!post) return;

    const authorPfp = resolveAuthorPfp(post.user);
    const isLiked   = (post.likes || []).includes(currentUser.id);

    const backdrop = document.createElement("div");
    backdrop.classList.add("post-modal-backdrop");
    backdrop.innerHTML = `
        <div class="post-modal">
            <div class="post-modal-image">
                ${post.image
                    ? `<img src="${post.image}" alt="post image">`
                    : `<div class="modal-text-only">${post.text || ""}</div>`}
            </div>
            <div class="post-modal-details">
                <div class="post-modal-header">
                    ${authorPfp ? `<img src="${authorPfp}" alt="${post.user}">` : ""}
                    <span class="modal-username">${post.user}</span>
                    <div class="modal-options">
                        <i class="fa-solid fa-ellipsis"></i>
                        <div class="dropdown hidden">
                            <p class="edit-btn">Edit</p>
                            <p class="delete-btn">Delete</p>
                        </div>
                    </div>
                    <button class="post-modal-close" aria-label="Close">X</button>
                </div>
                ${post.text ? `<div class="post-modal-caption">${post.text}</div>` : ""}
                <div class="post-modal-comments" id="modalComments">
                    ${renderComments(post.comments || [])}
                </div>
                <div class="post-modal-actions">
                    <div class="modal-like-row">
                        <button class="modal-like-btn" id="modalLikeBtn">
                            <img src="${isLiked ? "/media/v3.png" : "/media/empty-heart.png"}" alt="like" id="modalLikeImg">
                        </button>
                    </div>
                    <div class="modal-stats">
                        <strong id="modalLikeCount">${(post.likes || []).length}</strong> likes
                        · <span id="modalCommentCount">${(post.comments || []).length}</span> comments
                    </div>
                    <div class="modal-likes-list" id="modalLikesList">
                        ${renderLikesList(post.likes || [])}
                    </div>
                </div>
                <div class="post-modal-add-comment">
                    <input type="text" id="modalCommentInput" placeholder="Add a comment...">
                    <button class="modal-post-btn" id="modalPostBtn">Post</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(backdrop); });
    backdrop.querySelector(".post-modal-close").addEventListener("click", () => closeModal(backdrop));

    // dots menu
    const dots     = backdrop.querySelector(".fa-ellipsis");
    const dropdown = backdrop.querySelector(".dropdown");
    dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });
    // Named handler so we can remove it on close to prevent memory leak
    const closeDropdown = () => dropdown.classList.add("hidden");
    document.addEventListener("click", closeDropdown);

    // delete
    backdrop.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts = posts.filter(p => p.id != postId);
        localStorage.setItem("posts", JSON.stringify(posts));
        document.removeEventListener("click", closeDropdown);
        closeModal(backdrop);
        renderGrid();
    });

    // edit
    backdrop.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.add("hidden");

        const captionEl = backdrop.querySelector(".post-modal-caption");
        if (captionEl) {
            const currentText = captionEl.textContent;
            const textarea = document.createElement("textarea");
            textarea.value = currentText;
            textarea.classList.add("edit-caption");
            captionEl.replaceWith(textarea);
            textarea.focus();
            textarea.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const updatedText = textarea.value;
                    const newCaption = document.createElement("div");
                    newCaption.classList.add("post-modal-caption");
                    newCaption.textContent = updatedText;
                    textarea.replaceWith(newCaption);
                    const posts = JSON.parse(localStorage.getItem("posts")) || [];
                    const current = posts.find(p => p.id == postId);
                    if (current) current.text = updatedText;
                    localStorage.setItem("posts", JSON.stringify(posts));
                    renderGrid();
                }
            });
        }

        const postContent = backdrop.querySelector(".post-modal-image");
        let imgEdit = postContent.querySelector("img");
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    if (!imgEdit) {
                        imgEdit = document.createElement("img");
                        postContent.innerHTML = "";
                        postContent.appendChild(imgEdit);
                    }
                    imgEdit.src = event.target.result;
                    const posts = JSON.parse(localStorage.getItem("posts")) || [];
                    const current = posts.find(p => p.id == postId);
                    if (current) current.image = event.target.result;
                    localStorage.setItem("posts", JSON.stringify(posts));
                    renderGrid();
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(fileInput);
        });
    });

    // like — uses currentUser.id consistently
    backdrop.querySelector("#modalLikeBtn").addEventListener("click", () => {
        const posts   = JSON.parse(localStorage.getItem("posts")) || [];
        const current = posts.find(p => p.id == postId);
        if (!current) return;
        if (!current.likes) current.likes = [];
        const uid = currentUser.id;
        if (current.likes.includes(uid)) {
            current.likes = current.likes.filter(u => u !== uid);
        } else {
            current.likes.push(uid);
        }
        localStorage.setItem("posts", JSON.stringify(posts));
        const nowLiked = current.likes.includes(uid);
        backdrop.querySelector("#modalLikeImg").src           = nowLiked ? "/media/v3.png" : "/media/empty-heart.png";
        backdrop.querySelector("#modalLikeCount").textContent = current.likes.length;
        backdrop.querySelector("#modalLikesList").innerHTML   = renderLikesList(current.likes);
        renderGrid();
    });

    // comment
    const commentInput = backdrop.querySelector("#modalCommentInput");
    backdrop.querySelector("#modalPostBtn").addEventListener("click", () => postComment(postId, commentInput, backdrop));
    commentInput.addEventListener("keydown", (e) => { if (e.key === "Enter") postComment(postId, commentInput, backdrop); });
}

function postComment(postId, input, backdrop) {
    const text = input.value.trim();
    if (!text) return;
    const posts   = JSON.parse(localStorage.getItem("posts")) || [];
    const current = posts.find(p => p.id == postId);
    if (!current) return;
    if (!current.comments) current.comments = [];
    const commentObj = {
        user:       currentUser.id,
        username:   currentUser.username,
        profilePic: localStorage.getItem("userProfilePic") || currentUser.profilePicture || "media/emptypfp.jpg",
        text,
        time:       new Date().toLocaleString()
    };
    current.comments.push(commentObj);
    localStorage.setItem("posts", JSON.stringify(posts));

    const commentsDiv = backdrop.querySelector("#modalComments");
    const el = document.createElement("div");
    el.innerHTML = renderSingleComment(commentObj);
    commentsDiv.appendChild(el.firstElementChild);
    commentsDiv.scrollTop = commentsDiv.scrollHeight;
    backdrop.querySelector("#modalCommentCount").textContent = current.comments.length;
    input.value = "";
    renderGrid();
}

function closeModal(backdrop) {
    backdrop.style.transition = "opacity 0.15s ease";
    backdrop.style.opacity    = "0";
    setTimeout(() => backdrop.remove(), 150);
}

function renderComments(comments) {
    if (!comments || !comments.length) return `<p style="color:#bbb;font-size:.85rem;text-align:center;margin-top:1rem;">No comments yet.</p>`;
    return comments.map(renderSingleComment).join("");
}

function getUser(userId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users.find(u => u.id === userId);
}

// Guard against null user so modal never crashes
function renderSingleComment(c) {
    const pfp = c.profilePic || "media/emptypfp.jpg";
    const userObj = getUser(c.user);
    const displayName = c.username || (userObj ? userObj.username : "Unknown");
    return `<div class="modal-comment">
        <img src="${pfp}" alt="${displayName}">
        <div class="modal-comment-body"><strong>${displayName}</strong> ${c.text}</div>
    </div>`;
}

function idToUsername(likes) {
    return likes.map(l => {
        const user = getUser(l);
        return user ? user.username : "Unknown";
    });
}

function renderLikesList(likes) {
    if (!likes || !likes.length) return "";
    const names = idToUsername(likes);
    if (likes.length <= 5) return `Liked by: ${names.join(", ")}`;
    return `Liked by: ${names.slice(0, 5).join(", ")} and ${likes.length - 5} more`;
}

function resolveAuthorPfp(username) {
    if (username === currentUser.username) {
        return localStorage.getItem("userProfilePic") || currentUser.profilePicture || null;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user  = users.find(u => u.username === username);
    return (user && user.profilePicture && user.profilePicture !== "default.png") ? user.profilePicture : null;
}