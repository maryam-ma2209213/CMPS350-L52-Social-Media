const profilePic = document.getElementById("profile-picture");
const profileInput = document.getElementById("selectedPfp");
const savedPfp = localStorage.getItem("userProfilePic");

if (savedPfp) {
    profilePic.src = savedPfp;
}
profilePic.addEventListener("click", () => {
    profileInput.click();
});
profileInput.addEventListener("change", () => {
    const file = profileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profilePic.src = event.target.result; 
            localStorage.setItem("userProfilePic", event.target.result);
        }
        reader.readAsDataURL(file);
    }
});