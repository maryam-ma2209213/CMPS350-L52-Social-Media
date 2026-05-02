"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar/sidebar";

export default function CreatePostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setError("");
    if (!caption.trim() && !imageFile) {
      setError("Please add a caption or an image.");
      return;
    }
    setLoading(true);
    const userId = localStorage.getItem("userId");

    const formData = new FormData();
    formData.append("authorId", userId);
    if (caption.trim()) formData.append("caption", caption.trim());
    if (imageFile) formData.append("image", imageFile);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData, // NO Content-Type header — browser sets it with boundary automatically
    });

    if (res.ok) {
      router.push("/feed");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create post.");
      setLoading(false);
    }
  }

  function handleDiscard() {
    setCaption("");
    setPreview(null);
    setImageFile(null);
  }

  const [username, setUsername] = useState("");
const [avatar, setAvatar] = useState(null);

useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then((data) => {
      setUsername(data.username || "");
      setAvatar(data.avatar || null);
    });
}, []);

  return (
    <>
      <script src="https://kit.fontawesome.com/05b76dde2a.js" crossOrigin="anonymous" async></script>
      <Sidebar />
      <main>
        <div className="memory">
          <div className="sides">
            <div className="mem-pic">
              <p
                className="attachTrigger"
                onClick={() => fileRef.current.click()}
                style={{ cursor: "pointer" }}>
                <i className="fa-solid fa-camera-retro"></i> Attach your memories
              </p>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <div className="mem-line">
              <p><i className="fa-solid fa-feather-pointed"></i> Write a memorable line</p>
            </div>
          </div>

          <article className="feed-card">
            <div className="post-top">
              <div className="user">
                <img src={avatar || "/media/emptypfp.jpg"} alt="user" className="userPfpImage" />
                <h6 className="post-owner">{username}</h6>
              </div>
            </div>
            <div className="post-content">
              {preview ? (
                <img src={preview} alt="post preview" id="postPicture" />
              ) : (
                <div style={{
                  width: "80%", aspectRatio: "1/1", background: "rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 8, margin: "0 auto", cursor: "pointer", color: "var(--color-text-muted)"
                }} onClick={() => fileRef.current.click()}>
                  <i className="fa-solid fa-image" style={{ fontSize: "2rem" }} />
                </div>
              )}
            </div>
            <div id="postCaption">
              <textarea
                id="caption"
                placeholder="Write about your day..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ display: "block", width: "80%", margin: "0 auto" }}
              />
            </div>
          </article>
        </div>

        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

        <div className="buttons">
          <button id="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting..." : "Create Post"}
          </button>
          <button id="reset" onClick={handleDiscard}>Discard Changes</button>
        </div>
      </main>
    </>
  );
}