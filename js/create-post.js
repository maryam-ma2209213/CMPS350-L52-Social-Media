const trigger = document.querySelector(".attachTrigger");
const picInput = document.getElementById("pictureUpload");
const postPic = document.getElementById("postPicture");

const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const postOwner = document.querySelector(".post-owner");
if (postOwner && currentUser) postOwner.textContent = currentUser.username;

trigger.addEventListener("click", function() {
    picInput.click();
});

picInput.addEventListener("change", function() {
    const file = picInput.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(event){
            postPic.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

const write = document.querySelector(".mem-line p");
const caption = document.getElementById("caption");
const postCaption = document.getElementById("postCaption");

write.addEventListener("click", function() {
    caption.style.display = "block";
    caption.focus();
});

caption.addEventListener("input", function () {
  caption.style.height = "auto";
  caption.style.height = caption.scrollHeight + "px";
});


const submitBtn = document.getElementById("submit");
submitBtn.addEventListener("click", savePost);

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener('click',function () {
    caption.value = "";
    postPic.src = "/media/emptypfp.jpg";
})

function savePost(){
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const captionText = caption.value;
    const postImage = postPic.src.includes("emptypfp.jpg") ? null : postPic.src; 
    
    // in case the user posted an emtpty post
    if (!captionText && !postImage) {
        alert("You can't post nothing! Write something or attach an image.");
        return;
    }
    let posts = JSON.parse(localStorage.getItem("posts"));
    if (posts === null) {
        posts = [];
    }
    let lastId = localStorage.getItem("lastPostId");
    if (lastId === null) {
    lastId = 0;
    }
    else {
    lastId = parseInt(lastId);
    }
    const newPost = {
        id: lastId + 1,
        text: captionText,
        image: postImage,
        user: currentUser ? currentUser.username : "Username",
        time: new Date().toLocaleString(),
        likes: [],
        comments: [],
    };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    localStorage.setItem("lastPostId", newPost.id);
    caption.value = "";
    postPic.src = "/media/emptypfp.jpg";
}

const savedPfp = localStorage.getItem("userProfilePic");
if (savedPfp) {
    const userPfps = document.querySelectorAll(".userPfpImage");
    userPfps.forEach(img => img.src = savedPfp);
}