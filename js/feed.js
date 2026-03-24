const feedSection = document.querySelector(".feed-section");
const posts = JSON.parse(localStorage.getItem("posts")) || [];

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
        <img class="likeBtn" src="/media/empty-heart.png" alt="like button">
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
});