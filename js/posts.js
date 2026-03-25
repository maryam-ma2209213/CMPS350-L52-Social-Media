// // comments show, hide part

// const btn = document.querySelector(".btn");
// const commentSection = document.querySelector(".comment-section");
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

// prevent unauthorized access
if (!currentUser) {
  window.location.href = "login.html";
}

// btn.addEventListener("click", show);

// function show() {
//     commentSection.classList.toggle("hidden");
// }

// // add comments
// const comments = document.querySelector(".comments");
// const addComment = document.querySelector(".add-comment");
// const addBtn = document.querySelector(".add-button");

// addBtn.addEventListener("click", inputComment);

// function inputComment() {
//     const input = addComment.value;
//     // if comment empty
//     if (input === "") return;
//     // otherwise
//     const newComment = document.createElement("p");
//     newComment.textContent = input;
//     comments.append(newComment);

//     //clear the comment bar
//     addComment.value = "";
// }

// // like button
// const like = document.querySelector(".likeBtn");

// like.addEventListener("click",liked);
// function liked(){
//     like.classList.toggle("liked");
//     if(like.classList.contains("liked")){
//         like.src = "/media/v3.png"
//     }
//     else{
//         like.src = "/media/empty-heart.png"
//     }
// }

// logout button
const logoutBtn = document.querySelector("#logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();


    const logoutBtn = document.querySelector("#logout-btn");
    const modal = document.querySelector("#logout-confirm");
    const confirmLogout = document.querySelector("#confirm-logout");
    const cancelLogout = document.querySelector("#cancel-logout");

    if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("hidden");
    });
    }

    if (cancelLogout) {
    cancelLogout.addEventListener("click", () => {
        modal.classList.add("hidden"); // hide modal
    });
    }

    if (confirmLogout) {
    confirmLogout.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    });
    }
  });
}