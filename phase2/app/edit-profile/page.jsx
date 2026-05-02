"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar/sidebar";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", bio: "", avatar: "", gender: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "/login"; return; }

    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          username: data.username || "",
          bio: data.bio || "",
          avatar: data.avatar || "",
          gender: data.gender || "",
        });
        setPreview(data.avatar || null);
      });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const userId = localStorage.getItem("userId");

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    formData.append("gender", form.gender);
    if (imageFile) formData.append("avatar", imageFile);

    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      localStorage.setItem("username", form.username);
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 1000);
    } else {
      const data = await res.json();
      setError(data.error || "Update failed.");
    }

    setLoading(false);
  }

  return (
    <div className="edit-profile-body">
      <Sidebar />
      <header>
        <h2 id="edit-prof-h2">Edit Profile</h2>
      </header>

      <section className="edit-profile-section">
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <fieldset className="edit-profile-fieldset">

            <div className="pfp-edit-div">
              <label>Update your profile picture</label>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                    margin: "8px auto", display: "block", border: "3px solid var(--color-text-muted)" }}
                />
              )}
              <input
                type="file"
                id="profile-pic"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
                style={{ width: "auto" }}
              />
            </div>

            <div className="username-edit-div">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Your username"
              />
            </div>

            <div className="aboutyou-edit-div">
              <label htmlFor="bio">About you</label>
              <textarea
                id="bio"
                name="bio"
                maxLength={70}
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="gender-div">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="" disabled hidden>-- Select Gender --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

          </fieldset>

          {error && <p style={{ color: "red", fontSize: "0.85rem" }}>{error}</p>}
          {success && <p style={{ color: "green", fontSize: "0.85rem" }}>Profile updated! Redirecting...</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </section>
    </div>
  );
}