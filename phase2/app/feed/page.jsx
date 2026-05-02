"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../Sidebar/sidebar";

function FollowingRow({ currentUserId, refreshFollowing  }) {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetch(`/api/follows?userId=${currentUserId}&type=following`)
      .then((r) => r.json())
      .then(setFollowing)
      .catch(() => {});
  }, [currentUserId, refreshFollowing]);

  if (following.length === 0) return null;

  return (
    <div className="following-row">
      {following.map((f) => {
        const user = f.following;
        if (!user) return null;
        return (
          <Link key={user.id} href={`/profile/${user.id}`} className="following-row-item">
            <img src={user.avatar || "/media/emptypfp.jpg"} alt={user.username} />
            <span>{user.username}</span>
          </Link>
        );
      })}
    </div>
  );
}

function PostCard({ post, currentUserId, onPostDelete, onFollowChange }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Edit caption state
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [showPostDeleteConfirm, setShowPostDeleteConfirm] = useState(false);

  const isOwn = post.authorId === Number(currentUserId);

  useEffect(() => {
    fetch(`/api/likes?postId=${post.id}`)
      .then((r) => r.json())
      .then((data) => {
        setLikeCount(data.length);
        setLiked(data.some((l) => l.userId === Number(currentUserId)));
      });

    fetch(`/api/comments?postId=${post.id}`)
      .then((r) => r.json())
      .then(setComments);

    if (!isOwn) {
      fetch(`/api/follows?userId=${currentUserId}&type=following`)
        .then((r) => r.json())
        .then((data) => {
          setFollowing(data.some((f) => f.following?.id === post.authorId));
        });
    }
  }, [post.id, currentUserId]);

  async function toggleLike() {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, userId: Number(currentUserId) }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => data.liked ? c + 1 : c - 1);
  }

  async function toggleFollow() {
  const res = await fetch("/api/follows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      followerId: Number(currentUserId),
      followingId: post.authorId
    }),
  });

  const data = await res.json();
  setFollowing(data.following);

  if (onFollowChange) onFollowChange();
}

  async function addComment() {
    if (!newComment.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, postId: post.id, authorId: Number(currentUserId) }),
    });
    const created = await res.json();
    setComments((prev) => [...prev, created]);
    setNewComment("");
  }

  async function deleteComment(commentId) {
    await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setShowDeleteModal(false);
    setCommentToDelete(null);
  }

  async function saveCaption() {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    setEditing(false);
  }

  async function deletePost() {
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onPostDelete(post.id);
  }

  return (
    <>
      <div className="feed-card">
        <div className="post-top">
          <div className="user-left">
            <img
              src={post.author?.avatar || "/media/emptypfp.jpg"}
              alt="avatar"
              style={{ width: 35, height: 35, borderRadius: "50%", objectFit: "cover" }}
            />
            <Link href={isOwn ? "/profile" : `/profile/${post.authorId}`}
              style={{ fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", color: "inherit" }}>
              {post.author?.username || "Unknown"}
            </Link>
          </div>

          <div className="user-right">
            {/* Edit & delete — only on own posts */}
            {isOwn && (
              <>
                <i
                  className="fa-regular fa-pen-to-square edit-icon"
                  title="Edit caption"
                  style={{ cursor: "pointer", color: "var(--color-text-muted)", fontSize: "1rem" }}
                  onClick={() => setEditing((v) => !v)}
                />
                <i
                  className="fa-regular fa-trash-can delete-icon"
                  title="Delete post"
                  style={{ cursor: "pointer", color: "#e74c3c", fontSize: "1rem" }}
                  onClick={() => setShowPostDeleteConfirm(true)}
                />
              </>
            )}

            {/* Follow button — only on others' posts */}
            {!isOwn && (
              <button
                onClick={toggleFollow}
                style={{
                  background: following ? "var(--color-text-muted)" : "var(--color-accent)",
                  color: "white", border: "none", borderRadius: 4,
                  padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer",
                }}>
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {post.image && (
          <div className="post-content">
            <img src={post.image} alt="post" style={{ cursor: "pointer" }} />
          </div>
        )}

        {/* Caption or edit textarea */}
        {editing ? (
          <div style={{ padding: "0 8px 8px" }}>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              style={{ width: "100%", fontSize: "0.88rem", borderRadius: 6, border: "1px solid var(--color-border)",
                padding: 6, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn-secondary" style={{ flex: 1, padding: "5px" }} onClick={() => setEditing(false)}>Cancel</button>
              <button style={{ flex: 1, padding: "5px", background: "var(--color-accent)", color: "white",
                border: "none", borderRadius: 6, cursor: "pointer" }} onClick={saveCaption}>Save</button>
            </div>
          </div>
        ) : (
          caption && (
            <p style={{ padding: "0 8px", fontSize: "0.9rem" }}>
              <strong>{post.author?.username}</strong> {caption}
            </p>
          )
        )}

        <div className="likeBar">
          <button onClick={toggleLike} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <img
              src={liked ? "/media/v3.png" : "/media/empty-heart.png"}
              alt="like"
              style={{ width: 20, height: 20, objectFit: "contain", marginRight:15}}
            />
          </button>
          <span className="likeCount">{likeCount}</span>
          <button
            onClick={() => setShowComments((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 8, fontSize: "1.2rem" }}>
            💬
          </button>
          <span style={{ fontSize: "0.85rem", marginLeft: 4 }}>{comments.length}</span>
        </div>

        {showComments && (
          <div className="comment-section">
            <div className="comment-box">
              <div className="comments">
                {comments.length === 0 && (
                  <p style={{ color: "gray", fontSize: "0.8rem", margin: 8 }}>No comments yet.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 8px" }}>
                    <img src={c.author?.avatar || "/media/emptypfp.jpg"} className="commentPfp" alt="pfp" />
                    <span style={{ fontSize: "0.83rem" }}>
                      <strong>{c.author?.username}</strong> {c.content}
                    </span>
                    {c.authorId === Number(currentUserId) && (
                      <button
                        onClick={() => { setCommentToDelete(c.id); setShowDeleteModal(true); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", marginLeft: "auto", fontSize: "0.75rem" }}>
                        🗑
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="add">
                <input
                  type="text"
                  className="add-comment"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                />
                <button className="comment-box button" onClick={addComment}>+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete comment confirmation */}
      {showDeleteModal && (
        <div className="confirm">
          <div className="confirm-card">
            <h3>Delete Comment</h3>
            <p>Are you sure you want to delete this comment?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => { setShowDeleteModal(false); setCommentToDelete(null); }}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteComment(commentToDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete post confirmation */}
      {showPostDeleteConfirm && (
        <div className="confirm">
          <div className="confirm-card">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowPostDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={deletePost}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshFollowing, setRefreshFollowing] = useState(0);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) { window.location.href = "/login"; return; }
    setCurrentUserId(uid);

    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); });
  }, []);

  function handlePostDelete(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <>
      <script src="https://kit.fontawesome.com/05b76dde2a.js" crossOrigin="anonymous" async></script>
      <Sidebar />
      <main>
        <h2 className="feed-header">For You</h2>
        {currentUserId && (<FollowingRow currentUserId={currentUserId} refreshFollowing={refreshFollowing}/>)}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center" }}>No posts yet.</p>
        ) : (
          <section className="feed-section">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} onPostDelete={handlePostDelete} onFollowChange={() => setRefreshFollowing((v) => v + 1)} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}