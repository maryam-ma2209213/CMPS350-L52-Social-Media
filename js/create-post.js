// create-post.js — fixed
const trigger = document.querySelector(".attachTrigger");
const picInput = document.getElementById("pictureUpload");
const postPic  = document.getElementById("postPicture");

const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) window.location.href = "login.html";

const postOwner = document.querySelector(".post-owner");
if (postOwner && currentUser) postOwner.textContent = currentUser.username;

// load author pfp in preview
const savedPfp = localStorage.getItem("userProfilePic");
if (savedPfp) {
    const userPfps = document.querySelectorAll(".userPfpImage");
    userPfps.forEach(img => img.src = savedPfp);
}

trigger.addEventListener("click", () => picInput.click());

// track whether user has picked an image
let pickedImageSrc = null;

picInput.addEventListener("change", () => {
    const file = picInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            postPic.src     = event.target.result;
            pickedImageSrc  = event.target.result; // store separately
        };
        reader.readAsDataURL(file);
    }
});

const write       = document.querySelector(".mem-line p");
const caption     = document.getElementById("caption");

write.addEventListener("click", () => {
    caption.style.display = "block";
    caption.focus();
});

caption.addEventListener("input", () => {
    caption.style.height = "auto";
    caption.style.height = caption.scrollHeight + "px";
});

const submitBtn = document.getElementById("submit");
submitBtn.addEventListener("click", savePost);

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", () => {
    caption.value  = "";
    postPic.src    = "media/emptypfp.jpg";
    pickedImageSrc = null;
    picInput.value = "";
});

function savePost() {
    // BUG 3 FIX: re-read currentUser fresh in case it changed
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) { window.location.href = "login.html"; return; }

    const captionText = caption.value.trim();
    // BUG 3 FIX: use the tracked pickedImageSrc instead of checking .src (which can be an absolute URL)
    const postImage = pickedImageSrc || null;

    if (!captionText && !postImage) {
        alert("You can't post nothing! Write something or attach an image.");
        return;
    }

    let posts  = JSON.parse(localStorage.getItem("posts")) || [];
    let lastId = parseInt(localStorage.getItem("lastPostId") || "0");

    const newPost = {
        id:       lastId + 1,
        text:     captionText,
        image:    postImage,
        user:     user.username,
        time:     new Date().toLocaleString(),
        likes:    [],
        comments: []
    };

    posts.push(newPost);
    localStorage.setItem("posts",      JSON.stringify(posts));
    localStorage.setItem("lastPostId", newPost.id);

    // reset form
    caption.value  = "";
    postPic.src    = "media/emptypfp.jpg";
    pickedImageSrc = null;
    picInput.value = "";

    // redirect to feed so user can see their post
    window.location.href = "feed.html";
}