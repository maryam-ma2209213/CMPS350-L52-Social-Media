const feedSection = document.querySelector(".feed-section");
const posts = JSON.parse(localStorage.getItem("posts")) || [];
// const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

feedSection.innerHTML = ""
if (posts.length === 0) {
    const popUp = document.createElement("p");
    popUp.classList.add("popUpmsg");
    popUp.textContent = "No Posts Yet! Share Something!";
    feedSection.appendChild(popUp);
} else
    [...posts].reverse().forEach(post => {
        const card = document.createElement("article");
        card.classList.add("feed-card");

        card.innerHTML = `
    <div class="post-top">
        <div class="user">
            ${localStorage.getItem("userProfilePic") ?
                `<img class="userPfpImage" src="${localStorage.getItem("userProfilePic")}" alt="user profile picture">`
                : ""}
            <h6 class="post-owner">${post.user}</h6>
        </div>
    </div>
    <div class="post-content">
        ${post.image ? `<img src="${post.image}" alt="post image">` : ""}
    </div>
    <p>${post.text}</p>
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
        const like = card.querySelector(".likeBtn");
        const count = card.querySelector(".likeCount");

        // if the user already liked it show
        if (currentUser && post.likes && post.likes.includes(currentUser.username)) {
            like.src = "/media/v3.png";
            like.classList.add("liked");
        }

        like.addEventListener("click", liked);
        function liked() {
            const posts = JSON.parse(localStorage.getItem("posts")) || [];
            const current = posts.find(p => p.id === post.id);
            const user = currentUser ? currentUser.username : null;
            if (!user) return;

            if (!current.likes) {
                current.likes = [];
            }
            // like.classList.toggle("liked");
            // if (like.classList.contains("liked")) {
            //     like.src = "/media/v3.png"
            // }
            // else {
            //     like.src = "/media/empty-heart.png"
            // }

            if (current.likes.includes(user)) {
                // remove like
                current.likes = current.likes.filter(u => u !== user);
                like.src = "/media/empty-heart.png";
                like.classList.remove("liked");
            } else {
                // like
                current.likes.push(user);
                like.src = "/media/v3.png";
                like.classList.add("liked");
            }

            count.textContent = current.likes.length;

            localStorage.setItem("posts", JSON.stringify(posts));
            // check posts here
        }

        // comments show, hide part

        const btn = card.querySelector(".btn");
        const commentSection = card.querySelector(".comment-section");

        if (btn) {
            btn.addEventListener("click", show);
        }

        function show() {
            commentSection.classList.toggle("hidden");
        }

        // add comments
        const comments = card.querySelector(".comments");
        const addComment = card.querySelector(".add-comment");
        const addBtn = card.querySelector(".add-button");

        if (post.comments) {
            post.comments.forEach(c => {
                // const p = document.createElement("p");
                // p.textContent = c.text;
                // comments.append(p);
                const newComment = document.createElement("div");
                const img = document.createElement("img");
                img.src = "media/emptypfp.jpg";
                img.alt = "profile pic";
                img.classList.add("commentPfp");



                const text = document.createElement("span");
                text.textContent = " " + c.user + ": " + c.text;

                newComment.appendChild(img);
                newComment.appendChild(text);
                comments.append(newComment);

            });
        }

        if (addBtn) {
            addBtn.addEventListener("click", inputComment);
        }

        function inputComment() {
            const input = addComment.value.trim();
            // trim here check
            // if comment empty
            if (input === "") return;
            // otherwise
            const posts = JSON.parse(localStorage.getItem("posts")) || [];
            const current = posts.find(p => p.id === post.id);

            if (!current.comments) {
                current.comments = [];
            }

            // add
            current.comments.push({
                user: currentUser.username,
                profilePic: currentUser.profilePicture,
                text: input,
                time: new Date().toLocaleString()
            });

            localStorage.setItem("posts", JSON.stringify(posts));


            const newComment = document.createElement("div");
            const img = document.createElement("img");
            img.src = "media/emptypfp.jpg";
            img.alt = "profile pic";
            img.classList.add("commentPfp");

            const text = document.createElement("span");
            text.textContent = " " + current.user + ": " + current.text;

            newComment.appendChild(img);
            newComment.appendChild(text);
            comments.append(newComment);

            //clear the comment bar
            addComment.value = "";
        }


    });