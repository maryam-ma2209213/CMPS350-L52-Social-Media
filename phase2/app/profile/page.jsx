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
                  textDecoration: "none", color: "inherit", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
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

function PostModal({ post, user, onClose, onDelete }) {
  const [comments, setComments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?postId=${post.id}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [post.id]);

  async function handleSaveCaption() {
    setSaving(true);
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    setSaving(false);
    setEditing(false);
    post.caption = caption; // update locally so modal reflects change
  }

  async function handleDelete() {
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDelete(post.id);
    onClose();
  }

  return (
    <>
      <div className="post-modal-backdrop" onClick={onClose}>
        <div className="post-modal" onClick={(e) => e.stopPropagation()}>

          {/* Left: image */}
          <div className="post-modal-image">
            {post.image ? (
              <img src={post.image} alt="post" />
            ) : (
              <div className="modal-text-only">{post.caption}</div>
            )}
          </div>

          {/* Right: details */}
          <div className="post-modal-details">
            <div className="post-modal-header">
              <img src={user?.avatar || "/media/emptypfp.jpg"} alt="avatar" />
              <span className="modal-username">{user?.username}</span>

              {/* Edit & Delete icons */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
                <i
                  className="fa-regular fa-pen-to-square"
                  title="Edit caption"
                  style={{ cursor: "pointer", color: "var(--color-text-muted)", fontSize: "1rem" }}
                  onClick={() => setEditing((v) => !v)}
                />
                <i
                  className="fa-regular fa-trash-can"
                  title="Delete post"
                  style={{ cursor: "pointer", color: "#e74c3c", fontSize: "1rem" }}
                  onClick={() => setShowDeleteConfirm(true)}
                />
                <button className="post-modal-close" onClick={onClose}>✕</button>
              </div>
            </div>

            {/* Caption / Edit area */}
            <div className="post-modal-caption">
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    style={{ width: "100%", fontSize: "0.88rem", borderRadius: 6,
                      border: "1px solid var(--color-border)", padding: 6, resize: "none",
                      fontFamily: "inherit", color: "var(--color-text-main)", background: "white" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: "6px" }}
                      onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn-danger" style={{ flex: 1, padding: "6px", background: "var(--color-accent)" }}
                      onClick={handleSaveCaption} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                caption && <><strong>{user?.username}</strong> {caption}</>
              )}
            </div>

            <div className="post-modal-comments">
              {comments.length === 0 ? (
                <p style={{ color: "gray", fontSize: "0.82rem" }}>No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="modal-comment">
                    <img src={c.author?.avatar || "/media/emptypfp.jpg"} alt="pfp" />
                    <div className="modal-comment-body">
                      <strong>{c.author?.username}</strong> {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="confirm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

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

  // Remove deleted post from list without refetching
  function handlePostDelete(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
            <p style={{ cursor: "pointer" }} onClick={() => setModal("followers")}>
              <strong>{followers.length}</strong> followers
            </p>
            <p style={{ cursor: "pointer" }} onClick={() => setModal("following")}>
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
            <div className="post" key={post.id} onClick={() => setSelectedPost(post)}
              style={{ cursor: "pointer" }}>
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

      {selectedPost && (
        <PostModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
          onDelete={handlePostDelete}
        />
      )}

      {modal === "followers" && (
        <UserListModal title="Followers" users={followers} onClose={() => setModal(null)} />
      )}
      {modal === "following" && (
        <UserListModal title="Following" users={following} onClose={() => setModal(null)} />
      )}
    </>
  );
}