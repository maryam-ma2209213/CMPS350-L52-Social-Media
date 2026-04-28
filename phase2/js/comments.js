// comments show, hide part

const btn = document.querySelector(".btn");
const commentSection = document.querySelector(".comment-section");

btn.addEventListener("click", show);

function show() {
    commentSection.classList.toggle("hidden");
}

// add comments
const comments = document.querySelector(".comments");
const addComment = document.querySelector(".add-comment");
const addBtn = document.querySelector(".add-button");

addBtn.addEventListener("click", inputComment);

function inputComment() {
    const input = addComment.value;
    // if comment empty
    if (input === "") return;
    // otherwise
    const newComment = document.createElement("p");
    newComment.textContent = input;
    comments.append(newComment);

    //clear the comment bar
    addComment.value = "";
}