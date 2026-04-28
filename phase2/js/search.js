
(function () {
    const side = document.querySelector(".side");
    if (!side) return;

    const searchContainer = document.createElement("div");
    searchContainer.classList.add("search-container");
    searchContainer.innerHTML = `
        <div class="search-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon" id="searchIcon"></i>
            <input type="text" id="searchInput" placeholder="Search users…" autocomplete="off">
            <div class="search-results hidden" id="searchResults"></div>
        </div>
    `;
    // make at top of sidebar, before the page-links ul
    const pageLinks = side.querySelector(".page-links");
    side.insertBefore(searchContainer, pageLinks);
    // searching logic

    // const searchInput   = document.getElementById("searchInput");
    // const searchResults = document.getElementById("searchResults");
    const searchIcon = searchContainer.querySelector("#searchIcon");
    const searchInput = searchContainer.querySelector("#searchInput");
    const searchResults = searchContainer.querySelector("#searchResults");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = "";

        if (!query) {
            searchResults.classList.add("hidden");
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const matches = users.filter(u =>
            u.username.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            searchResults.innerHTML = `<p class="search-no-results">No users found</p>`;
        } else {
            matches.forEach(u => {
                const pfp = (u.profilePicture && u.profilePicture !== "default.png")
                    ? u.profilePicture
                    : "media/emptypfp.jpg";
                const isMe = currentUser && u.id === currentUser.id;
                const href = isMe ? "user-profile.html" : `other-profile.html?user=${encodeURIComponent(u.username)}`;

                const item = document.createElement("a");
                item.href = href;
                item.classList.add("search-result-item");
                item.innerHTML = `
                    <img src="${pfp}" alt="${u.username}">
                    <span>${u.username}</span>
                `;
                searchResults.appendChild(item);
            });
        }

        searchResults.classList.remove("hidden");
    });

    searchIcon.addEventListener("click", () => {
    searchInput.classList.toggle("active");

    if (searchInput.classList.contains("active")) {
        searchInput.focus();
    }
});

    // close results when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.classList.add("hidden");
            searchInput.classList.remove("active");
        }
    });
})();