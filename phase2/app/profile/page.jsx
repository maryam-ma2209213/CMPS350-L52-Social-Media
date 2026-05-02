"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../Sidebar/sidebar";

function UserListModal({ title, users, onClose }) {
  return (
    <div className="confirm" onClick={onClose}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 340, width: "90%", maxHeight: "70vh", overflowY: "auto" }}>
        <h3 style={{ marginBottom: 16 }}>{title}</h3>
        {users.length === 0 ? (
          <p style={{ color: "gray", fontSize: "0.85rem" }}>Nobody here yet.</p>
        ) : (
          users.map((entry) => {
            const user = entry.follower || entry.following;
            if (!user) return null;
            return (
              <Link key={user.id} href={`/profile/${user.id}`}
                onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  textDecoration: "none", color: "inherit", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <img src={user.avatar || "/media/emptypfp.jpg"} alt={user.username}
                  style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.username}</span>
              </Link>
            );
          })
        )}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "followers" | "following" | null

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "/login"; return; }

    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch(`/api/posts?authorId=${userId}`).then((r) => r.json()),
      fetch(`/api/follows?userId=${userId}&type=followers`).then((r) => r.json()),
      fetch(`/api/follows?userId=${userId}&type=following`).then((r) => r.json()),
    ]).then(([userData, postsData, followersData, followingData]) => {
      setUser(userData);
      setPosts(postsData);
      setFollowers(followersData);
      setFollowing(followingData);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>;

  return (
    <>
      <script src="https://kit.fontawesome.com/05b76dde2a.js" crossOrigin="anonymous" async></script>
      <Sidebar />
      <main>
        <div className="profile-info-div">
          <div className="profile-pic-div">
            <img
              src={user?.avatar || "/media/emptypfp.jpg"}
              alt="profile"
              id="profile-picture"
              width={100}
              height={100}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <div className="username-div">
            <h3 id="username-h3">{user?.username}</h3>
          </div>
          <div className="about-you-div">
            <p id="about-you">{user?.bio || "No bio yet."}</p>
          </div>

          <div className="posts-followers-following">
            <p><strong>{posts.length}</strong> posts</p>
            <p
              style={{ cursor: "pointer" }}
              onClick={() => setModal("followers")}>
              <strong>{followers.length}</strong> followers
            </p>
            <p
              style={{ cursor: "pointer" }}
              onClick={() => setModal("following")}>
              <strong>{following.length}</strong> following
            </p>
          </div>
        </div>

        <Link href="/edit-profile" id="edit-prof-link">Edit Profile</Link>

        <div className="user-posts-div">
          {posts.length === 0 && (
            <p style={{ textAlign: "center", color: "gray" }}>No posts yet.</p>
          )}
          {posts.map((post) => (
            <div className="post" key={post.id}>
              {post.image ? (
                <img src={post.image} alt="post" />
              ) : (
                <div style={{
                  background: "var(--color-surface)", padding: "1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  aspectRatio: "1/1", fontSize: "0.85rem", color: "var(--color-text-muted)"
                }}>
                  {post.caption}
                </div>
              )}
              <div className="post-overlay">
                <span className="overlay-stat"><span>🤍</span> {post._count?.likes ?? 0}</span>
                <span className="overlay-stat"><span>💬</span> {post._count?.comments ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modal === "followers" && (
        <UserListModal title="Followers" users={followers} onClose={() => setModal(null)} />
      )}
      {modal === "following" && (
        <UserListModal title="Following" users={following} onClose={() => setModal(null)} />
      )}
    </>
  );
}