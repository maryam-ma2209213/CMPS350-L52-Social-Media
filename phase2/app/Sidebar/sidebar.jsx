"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const currentUserId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;

  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`/api/follows?userId=${userId}&type=following`)
      .then((r) => r.json())
      .then((data) => setFollowing(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then((data) => setSearchResults(data))
      .catch(() => {});
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
        setSearchActive(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  }

  return (
    <>
      <aside className="side">
        {/* Search */}
        <div className="search-container" ref={searchRef}>
          <div className="search-wrapper">
            <i
              className="fa-solid fa-magnifying-glass search-icon"
              onClick={() => setSearchActive((v) => !v)}
            />
            <input
              type="text"
              id="searchInput"
              className={searchActive ? "active" : ""}
              placeholder="Search users…"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results" id="searchResults">
                {searchResults.map((u) => {
                  const isMe = u.id === currentUserId;
                  const href = isMe ? "/profile" : `/profile/${u.id}`;
                  return (
                    <Link key={u.id} href={href} className="search-result-item"
                      onClick={() => { setSearchResults([]); setSearchActive(false); setSearchQuery(""); }}>
                      <img src={u.avatar || "/media/emptypfp.jpg"} alt={u.username} />
                      <span>{u.username}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {searchActive && searchQuery && searchResults.length === 0 && (
              <div className="search-results">
                <p className="search-no-results">No users found</p>
              </div>
            )}
          </div>
        </div>

        <ul className="page-links">
          <li><Link href="/feed"><i className="fa-solid fa-newspaper"></i></Link></li>
          <li><Link href="/profile"><i className="fa-solid fa-user"></i></Link></li>
          <li><Link href="/create-post"><i className="fa-solid fa-note-sticky"></i></Link></li>
          <li className="logout-item">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogout(true); }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </a>
          </li>
        </ul>
      </aside>

      {showLogout && (
        <div className="confirm">
          <div className="confirm-card">
            <h3>Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}