const trigger = document.getElementById("attachTrigger");
const picInput = document.getElementById("pictureUpload");
const postPic = document.getElementById("postPicture");

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

const write = document.getElementById("writeTrigger");
const caption = document.getElementById("caption");
const postCaption = document.getElementById("postCaption");

write.addEventListener("click", function() {
    caption.style.display = "block";
    caption.focus();
});
caption.addEventListener("input", function() {
    postCaption.textContent = caption.value;
});