// const trigger = document.getElementById("attachTrigger");
// const picInput = document.getElementById("pictureUpload");
// const postPic = document.getElementById("postPicture");

// trigger.addEventListener("click", function() {
//     picInput.click();
// });
// picInput.addEventListener("change", function() {
//     const file = picInput.files[0];
//     if(file){
//         const reader = new FileReader();
//         reader.onload = function(event){
//             postPic.src = event.target.result;
//         }
//         reader.readAsDataURL(file);
//     }
// });

const write = document.getElementById("writeTrigger");
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
})

function savePost(){
    const captionText = caption.value;
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
        user: "Username",
        time: new Date().toLocaleString()
    };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    localStorage.setItem("lastPostId", newPost.id);
    caption.value = "";
}

