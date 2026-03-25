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
        <div class="user-left">
            ${localStorage.getItem("userProfilePic") ? 
                `<img class="userPfpImage" src="${localStorage.getItem("userProfilePic")}" alt="user profile picture">` 
                : ""}
        <h6 class="post-owner">${post.user}</h6>
        </div>
        <div class="user-right">
            <i class="fa-regular fa-pen-to-square edit-icon"></i>
            <i class="fa-regular fa-trash-can delete-icon"></i>
        </div>
    </div>
    <div class="post-content">
        ${post.image ? `<img src="${post.image}" alt="post image">` : ""}
    </div>
    <p class="post-text">${post.text}</p>
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // icons next to username
        const editIcon = card.querySelector(".fa-pen-to-square");
        const deleteIcon = card.querySelector(".fa-trash-can");

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
                img.src = c.profilePic;
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
            const commentObj = {
                user: currentUser.id,
                profilePic: currentUser.profilePicture || "media/emptypfp.jpg",
                text: input,
                time: new Date().toLocaleString()
            };

            // add
            current.comments.push(commentObj);
            localStorage.setItem("posts", JSON.stringify(posts));


            const newComment = document.createElement("div");
            const img = document.createElement("img");
            img.src = commentObj.profilePic;
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //for the txt
    editIcon.addEventListener("click", () => {
    const captionEdit = card.querySelector(".post-text");
    const currentText = captionEdit.textContent;

    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.classList.add("edit-caption");
    captionEdit.replaceWith(textarea);
    textarea.focus();
    textarea.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
            e.preventDefault();
            const updatedText = textarea.value;
            captionEdit.textContent = updatedText;
            textarea.replaceWith(captionEdit);
            const posts = JSON.parse(localStorage.getItem("posts")) || [];
            const current = posts.find(p => p.id === post.id);
            current.text = updatedText;
            localStorage.setItem("posts", JSON.stringify(posts));
            }
        });
    });
    //for pictures
    editIcon.addEventListener("click", () => {
    const postContent = card.querySelector(".post-content");
    let imgEl = postContent.querySelector("img");
    if (!imgEl) {
        imgEl = document.createElement("img");
        postContent.appendChild(imgEl);
    }

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
                imgEl.src = event.target.result;
                const posts = JSON.parse(localStorage.getItem("posts")) || [];
                const current = posts.find(p => p.id === post.id);
                current.image = event.target.result;
                localStorage.setItem("posts", JSON.stringify(posts));
            };
            reader.readAsDataURL(file);
            }
        });
    });
    //for deleting the post
    deleteIcon.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this post?")) {
        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts = posts.filter(p => p.id !== post.id);
        localStorage.setItem("posts", JSON.stringify(posts));
        card.remove();
        if (posts.length === 0) {
            const popUp = document.createElement("p");
            popUp.classList.add("popUpmsg");
            popUp.textContent = "No Posts Yet! Share Something!";
            feedSection.appendChild(popUp);
            }
        }
    });
    });