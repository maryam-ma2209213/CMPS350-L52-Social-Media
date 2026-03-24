// auth.js will handle both login and resitration forms

// How we want our structure to look like: (EXAMPLE)
// {
//   users: [
//     {
//       id: "u1",
//       username: "maryam",
//       email: "maryam@email.com",
//       password: "123456",
//       profilePicture: "default.png"
//     }
//   ]
// }

// In local Storage key:value (key=> users, value=> JSON string)

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
if(loginForm){
    loginForm.addEventListener("submit", handleLogin); //if user wants to login, we add an add event listener 
    //the event we are waiting for in this case will be the "submit" event, when the button is pressed call its dedicated function
}
if(registerForm){
    registerForm.addEventListener("submit", handleRegister);
}

// REGISTER
function handleRegister(event){//runs when the user submits the registeration form
    event.preventDefault(); //refresh the page

    const email = document.querySelector("#email").value.trim(); //remove whitespaces
    const username = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (!validateEmail(email)) {
        alert("Invalid email format");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || []; //get users from local storage
    //JSON.parse => convert JSON string into JS object

    const exists = users.find(u => u.email === email);
    if (exists) {
        alert("Email already registered");
        return;
    }

    const newUser = {
        id: "user-" + Date.now(),
        username,
        email,
        password,
        profilePicture: "default.png"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users)); //convert into Object back to String

    // alert("Registration successful!");

    //redirect to login page
    window.location.href = "login.html";
}


// LOGIN
function handleLogin(event){
    event.preventDefault(); //refresh the page

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    //find matching user
    const user = users.find(
        u => u.email === email && u.password === password
    );

    //if user not found
    if(!user){
        alert("Invalid email or password");
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    // alert("Login Successful!");
    
    window.location.href = "feed.html";
}

// HELPERS
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}