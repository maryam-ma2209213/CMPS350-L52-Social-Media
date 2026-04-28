// feed.js — fixed
const feedSection = document.querySelector(".feed-section");
// currentUser is declared in global.js (already loaded before this script)

// BUG 5 FIX: only show posts from the logged-in user + people they follow
function getVisiblePosts() {
    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    if (!currentUser) return allPosts;
    const myFollowing = JSON.parse(localStorage.getItem(`following_${currentUser.id}`)) || [];
    // include own posts and posts from followed users
    return allPosts.filter(p => p.user === currentUser.username || myFollowing.includes(p.user));
}



function renderFeed() {
    
    // inside renderFeed(), right after feedSection.innerHTML = ""
function renderFollowingCard() {
    if (!currentUser) return;

    const followingList = JSON.parse(localStorage.getItem(`following_${currentUser.id}`)) || [];
    if (followingList.length === 0) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const card = document.createElement("article");
    card.classList.add("feed-card", "following-card");

    let inner = `<h5>Following</h5><div class="following-list">`;

    followingList.forEach(username => {
        const user = users.find(u => u.username === username);
        const pfp = user && user.profilePicture ? user.profilePicture : "media/emptypfp.jpg";
        inner += `
            <div class="following-item">
                <img src="${pfp}" alt="${username} profile" class="following-pfp">
                <span>${username}</span>
            </div>
        `;
    });

    inner += `</div>`;
    card.innerHTML = inner;

    // prepend instead of append — shows on top
    feedSection.prepend(card);
}

// --- in renderFeed ---
feedSection.innerHTML = "";

// first render following card
renderFollowingCard();

// then render all posts as usual
const posts = getVisiblePosts();

    if (posts.length === 0) {
        const popUp = document.createElement("p");
        popUp.classList.add("popUpmsg");
        popUp.textContent = "No Posts Yet! Follow someone or share something!";
        feedSection.appendChild(popUp);
        return;
    }

    [...posts].reverse().forEach(post => {
        const card = document.createElement("article");
        card.classList.add("feed-card");

        // BUG 4 FIX: look up each post author's pfp individually instead of always using the logged-in user's pfp
        const authorPfp = resolveAuthorPfp(post.user);
        const pfpHtml = authorPfp
            ? `<img class="userPfpImage" src="${authorPfp}" alt="${post.user} profile picture">`
            : `<img class="userPfpImage" src="media/emptypfp.jpg" alt="profile picture">`;

        // Only show edit/delete icons on the user's own posts
        const isOwn = currentUser && post.user === currentUser.username;
        const actionIcons = isOwn
            ? `<i class="fa-regular fa-pen-to-square edit-icon"></i>
               <i class="fa-regular fa-trash-can delete-icon"></i>`
            : "";

        card.innerHTML = `
        <div class="post-top">
            <div class="user-left">
                ${pfpHtml}
                <h6 class="post-owner">${post.user}</h6>
            </div>
            <div class="user-right">
                ${actionIcons}
            </div>
        </div>
        <div class="post-content">
            ${post.image ? `<img src="${post.image}" alt="post image">` : ""}
        </div>
        <p class="post-text">${post.text || ""}</p>
        <p class="post-time">${post.time}</p>
        <div class="bar">
            <div class="likeBar">
                <img class="likeBtn" src="/media/empty-heart.png" alt="like button">
                <span class="likeCount">${post.likes ? post.likes.length : 0}</span>
            </div>
            <img class="btn" src="/media/c4.png" alt="comment button">
        </div>
        <div class="comment-section hidden">
            <div class="comment-box">
                <div class="comments"></div>
                <div class="add">
                    <input type="text" class="add-comment" placeholder="Write a comment...">
                    <button class="add-button">+</button>
                </div>
            </div>
        </div>
        `;

        feedSection.appendChild(card);

        // like button
        const like  = card.querySelector(".likeBtn");
        const count = card.querySelector(".likeCount");

        if (currentUser && post.likes && post.likes.includes(currentUser.id)) {
            like.src = "/media/v3.png";
            like.classList.add("liked");
        }

        like.addEventListener("click", () => {
            const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
            const current  = allPosts.find(p => p.id === post.id);
            if (!current) return;
            const uid = currentUser.id;
            if (!current.likes) current.likes = [];
            if (current.likes.includes(uid)) {
                current.likes = current.likes.filter(u => u !== uid);
                like.src = "/media/empty-heart.png";
                like.classList.remove("liked");
            } else {
                current.likes.push(uid);
                like.src = "/media/v3.png";
                like.classList.add("liked");
            }
            count.textContent = current.likes.length;
            localStorage.setItem("posts", JSON.stringify(allPosts));
        });

        // comments toggle
        const commentToggle  = card.querySelector(".btn");
        const commentSection = card.querySelector(".comment-section");
        if (commentToggle) {
            commentToggle.addEventListener("click", () => commentSection.classList.toggle("hidden"));
        }

        // load existing comments
        const commentsDiv = card.querySelector(".comments");
        if (post.comments) {
            post.comments.forEach(c => commentsDiv.appendChild(buildCommentEl(c)));
        }

        // add new comment
        const addComment = card.querySelector(".add-comment");
        const addBtn     = card.querySelector(".add-button");

        function submitComment() {
            const input = addComment.value.trim();
            if (!input) return;
            const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
            const current  = allPosts.find(p => p.id === post.id);
            if (!current) return;
            if (!current.comments) current.comments = [];
            const commentObj = {
                user:       currentUser.id,
                username:   currentUser.username,
                profilePic: localStorage.getItem("userProfilePic") || currentUser.profilePicture || "media/emptypfp.jpg",
                text:       input,
                time:       new Date().toLocaleString()
            };
            current.comments.push(commentObj);
            localStorage.setItem("posts", JSON.stringify(allPosts));
            commentsDiv.appendChild(buildCommentEl(commentObj));
            commentsDiv.scrollTop = commentsDiv.scrollHeight;
            addComment.value = "";
        }

        if (addBtn) addBtn.addEventListener("click", submitComment);
        addComment.addEventListener("keydown", (e) => { if (e.key === "Enter") submitComment(); });

        // edit / delete — only wired if user owns the post
        if (isOwn) {
            const editIcon   = card.querySelector(".edit-icon");
            const deleteIcon = card.querySelector(".delete-icon");

            // edit caption
            editIcon.addEventListener("click", () => {
                const captionEl = card.querySelector(".post-text");
                const currentText = captionEl.textContent;
                const textarea = document.createElement("textarea");
                textarea.value = currentText;
                textarea.classList.add("edit-caption");
                captionEl.replaceWith(textarea);
                textarea.focus();
                textarea.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        captionEl.textContent = textarea.value;
                        textarea.replaceWith(captionEl);
                        const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
                        const current  = allPosts.find(p => p.id === post.id);
                        if (current) current.text = captionEl.textContent;
                        localStorage.setItem("posts", JSON.stringify(allPosts));
                    }
                });
            });

            // delete post — BUG 1 FIX: re-render the whole feed after deletion so new cards get fresh event listeners
            deleteIcon.addEventListener("click", () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    let allPosts = JSON.parse(localStorage.getItem("posts")) || [];
                    allPosts = allPosts.filter(p => p.id !== post.id);
                    localStorage.setItem("posts", JSON.stringify(allPosts));
                    renderFeed(); // full re-render instead of card.remove()
                }
            });
        }
    });
}

// helpers
function buildCommentEl(c) {
    const div = document.createElement("div");
    div.classList.add("comment");
    const pfp = c.profilePic || "media/emptypfp.jpg";
    const displayName = c.username || resolveUsername(c.user);
    const img = document.createElement("img");
    img.src = pfp;
    img.alt = displayName + " profile pic";
    img.classList.add("commentPfp");
    const text = document.createElement("span");
    text.textContent = ` ${displayName}: ${c.text}`;
    div.appendChild(img);
    div.appendChild(text);
    return div;
}

function resolveUsername(userId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const u = users.find(u => u.id === userId);
    return u ? u.username : "Unknown";
}

// BUG 4 FIX: resolve each author's pfp from the users array, not from the current session key
function resolveAuthorPfp(username) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user  = users.find(u => u.username === username);
    if (!user) return null;
    // if this author is the logged-in user, prefer the live userProfilePic key (most up-to-date)
    if (currentUser && user.id === currentUser.id) {
        return localStorage.getItem("userProfilePic") || user.profilePicture || null;
    }
    return (user.profilePicture && user.profilePicture !== "default.png") ? user.profilePicture : null;
}

// initial render
renderFeed();