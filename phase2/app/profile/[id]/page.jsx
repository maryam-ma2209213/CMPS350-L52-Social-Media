"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../Sidebar/sidebar";

export default function OtherProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) { window.location.href = "/login"; return; }
    setCurrentUserId(uid);

    Promise.all([
      fetch(`/api/users/${id}`).then((r) => r.json()),
      fetch(`/api/posts?authorId=${id}`).then((r) => r.json()),
      fetch(`/api/follows?userId=${id}&type=followers`).then((r) => r.json()),
      fetch(`/api/follows?userId=${id}&type=following`).then((r) => r.json()),
    ]).then(([userData, postsData, followersData, followingData]) => {
      setUser(userData);
      setPosts(postsData);
      setFollowers(followersData);
      setFollowing(followingData);
      setIsFollowing(followersData.some((f) => f.followerId === Number(uid)));
      setLoading(false);
    });
  }, [id]);

  async function toggleFollow() {
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerId: Number(currentUserId), followingId: Number(id) }),
    });
    const data = await res.json();
    setIsFollowing(data.following);
    // Update followers count
    if (data.following) {
      setFollowers((prev) => [...prev, { followerId: Number(currentUserId) }]);
    } else {
      setFollowers((prev) => prev.filter((f) => f.followerId !== Number(currentUserId)));
    }
  }

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
              width={100}
              height={100}
              style={{ borderRadius: "50%", objectFit: "cover", marginTop: "2rem",
                border: "3.5px solid var(--color-text-muted)" }}
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
            <p><strong>{followers.length}</strong> followers</p>
            <p><strong>{following.length}</strong> following</p>
          </div>
        </div>

        <button type="button" className="follow-btn" onClick={toggleFollow}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>

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
    </>
  );
}