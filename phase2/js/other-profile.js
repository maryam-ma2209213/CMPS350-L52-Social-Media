// auth
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) window.location.href = "login.html";

// read target user from URL
const params     = new URLSearchParams(window.location.search);
const targetName = params.get("user");
if (!targetName) window.location.href = "feed.html";

// redirect if user's own profile
if (targetName === currentUser.username) window.location.href = "user-profile.html";

const allUsers   = JSON.parse(localStorage.getItem("users")) || [];
const targetUser = allUsers.find(u => u.username === targetName);

// header
const usernameHeader = document.getElementById("username-h3");
const aboutYouEl = document.getElementById("about-you");
const profilePic = document.getElementById("profile-picture");

if (usernameHeader) usernameHeader.textContent = targetName;
if (targetUser) {
    if (aboutYouEl) aboutYouEl.textContent = targetUser.bio || "No bio yet.";
    if (profilePic && targetUser.profilePicture && targetUser.profilePicture !== "default.png") {
        profilePic.src = targetUser.profilePicture;
    }
}

// follow button
const followBtn = document.querySelector(".follow-btn");
const followKey = `following_${currentUser.id}`;
let isFollowing = (JSON.parse(localStorage.getItem(followKey)) || []).includes(targetName);
 
function updateFollowBtn() {
    if (!followBtn) return;
    followBtn.textContent      = isFollowing ? "Following" : "Follow";
    followBtn.style.background = isFollowing ? "var(--color-accent)" : "";
}
updateFollowBtn();
if (followBtn) {
    followBtn.addEventListener("click", () => {
        const list = JSON.parse(localStorage.getItem(followKey)) || [];
        if (isFollowing) {
            localStorage.setItem(followKey, JSON.stringify(list.filter(u => u !== targetName)));
            isFollowing = false;
        } else {
            list.push(targetName);
            localStorage.setItem(followKey, JSON.stringify(list));
            isFollowing = true;
        }
        updateFollowBtn();
        updateStats(); 
    });
}
 
// posts / followers / following
const allPosts  = JSON.parse(localStorage.getItem("posts")) || [];
const userPosts = allPosts.filter(p => p.user === targetName);
function updateStats() {
    const followerCount = allUsers.filter(u => {
        const theirFollowing = JSON.parse(localStorage.getItem(`following_${u.id}`)) || [];
        return theirFollowing.includes(targetName);
    }).length + (isFollowing ? 0 : 0); 
    
    const freshFollowers = allUsers.filter(u => {
        const f = JSON.parse(localStorage.getItem(`following_${u.id}`)) || [];
        return f.includes(targetName);
    }).length;
 
    const targetFollowing = targetUser
        ? (JSON.parse(localStorage.getItem(`following_${targetUser.id}`)) || []).length
        : 0;
 
    const statEls = document.querySelectorAll(".posts-followers-following p");
    if (statEls[0]) statEls[0].textContent = `${userPosts.length} posts`;
    if (statEls[1]) statEls[1].textContent = `${freshFollowers} followers`;
    if (statEls[2]) statEls[2].textContent = `${targetFollowing} following`;
}
updateStats();
 
// posts grid
const postsGrid = document.querySelector(".user-posts-div");
if (postsGrid) {
    postsGrid.innerHTML = "";
    if (userPosts.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "This user hasn't posted yet.";
        empty.style.cssText = "grid-column:1/-1;text-align:center;opacity:.6;padding:2rem;";
        postsGrid.appendChild(empty);
    } else {
        userPosts.forEach(post => {
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
}
 
// modal
function openModal(postId) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const post  = posts.find(p => p.id == postId); 
    if (!post) return;
    const authorPfp = resolveAuthorPfp(post.user);
    const isLiked   = (post.likes || []).includes(currentUser.username);
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
                    <button class="post-modal-close" aria-label="Close">✕</button>
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
                    <input type="text" id="modalCommentInput" placeholder="Add a comment…">
                    <button class="modal-post-btn" id="modalPostBtn">Post</button>
                </div>
            </div>
        </div>
    `;
 
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(backdrop); });
    backdrop.querySelector(".post-modal-close").addEventListener("click", () => closeModal(backdrop));
    backdrop.querySelector("#modalLikeBtn").addEventListener("click", () => {
        const posts   = JSON.parse(localStorage.getItem("posts")) || [];
        const current = posts.find(p => p.id == postId);
        if (!current.likes) current.likes = [];
        const username = currentUser.username;
        if (current.likes.includes(username)) {
            current.likes = current.likes.filter(u => u !== username);
        } else {
            current.likes.push(username);
        }
        localStorage.setItem("posts", JSON.stringify(posts));
        const nowLiked = current.likes.includes(username);
        backdrop.querySelector("#modalLikeImg").src           = nowLiked ? "/media/v3.png" : "/media/empty-heart.png";
        backdrop.querySelector("#modalLikeCount").textContent = current.likes.length;
        backdrop.querySelector("#modalLikesList").innerHTML   = renderLikesList(current.likes);
        refreshGrid(targetName);
    });
    const commentInput = backdrop.querySelector("#modalCommentInput");
    backdrop.querySelector("#modalPostBtn").addEventListener("click", () => postComment(postId, commentInput, backdrop));
    commentInput.addEventListener("keydown", (e) => { if (e.key === "Enter") postComment(postId, commentInput, backdrop); });
}
 
function postComment(postId, input, backdrop) {
    const text = input.value.trim();
    if (!text) return;
    const posts   = JSON.parse(localStorage.getItem("posts")) || [];
    const current = posts.find(p => p.id == postId);
    if (!current.comments) current.comments = [];
    const commentObj = {
        user:       currentUser.username,
        profilePic: currentUser.profilePicture || localStorage.getItem("userProfilePic") || "media/emptypfp.jpg",
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
    refreshGrid(targetName);
}
 
function closeModal(backdrop) {
    backdrop.style.transition = "opacity 0.15s ease";
    backdrop.style.opacity    = "0";
    setTimeout(() => backdrop.remove(), 150);
}
 
function renderComments(comments) {
    if (!comments.length) return `<p style="color:#bbb;font-size:.85rem;text-align:center;margin-top:1rem;">No comments yet.</p>`;
    return comments.map(renderSingleComment).join("");
}
 
function renderSingleComment(c) {
    const pfp = c.profilePic || "media/emptypfp.jpg";
    return `<div class="modal-comment">
        <img src="${pfp}" alt="${c.user}">
        <div class="modal-comment-body"><strong>${c.user}</strong> ${c.text}</div>
    </div>`;
}
 
function renderLikesList(likes) {
    if (!likes.length) return "";
    if (likes.length <= 5) return `Liked by: ${likes.join(", ")}`;
    return `Liked by: ${likes.slice(0, 5).join(", ")} and ${likes.length - 5} more`;
}
 
function resolveAuthorPfp(username) {
    if (username === currentUser.username) {
        return localStorage.getItem("userProfilePic") || currentUser.profilePicture || null;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user  = users.find(u => u.username === username);
    return (user && user.profilePicture !== "default.png") ? user.profilePicture : null;
}
 
function refreshGrid(ownerName) {
    const posts  = JSON.parse(localStorage.getItem("posts")) || [];
    const theirs = posts.filter(p => p.user === ownerName);
    const cards  = document.querySelectorAll(".user-posts-div .post");
    cards.forEach((card, i) => {
        const post = theirs[i];
        if (!post) return;
        const overlay = card.querySelector(".post-overlay");
        if (overlay) {
            overlay.innerHTML = `
                <span class="overlay-stat"><span>🤍</span> ${(post.likes    || []).length}</span>
                <span class="overlay-stat"><span>💬</span> ${(post.comments || []).length}</span>
            `;
        }
    });
}