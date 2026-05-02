"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

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
        });
      });
  }, []);   

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleFileChange(e) {
  setFile(e.target.files[0]);
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

  if (file) {
    formData.append("avatar", file);
  }

  const res = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    body: formData, 
  });

  if (res.ok) {
    const data = await res.json();

    localStorage.setItem("username", form.username);
    if (data.avatar) {
      localStorage.setItem("avatar", data.avatar);
    }

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
      <header>
        <h2 id="edit-prof-h2">Edit Profile</h2>
      </header>

      <section className="edit-profile-section">
        <form className="edit-profile-form">
          <fieldset className="edit-profile-fieldset">

            <div className="pfp-edit-div">
              <label htmlFor="profile-pic">Update your profile picture</label>
              <input type="file" id="profile-pic" accept="image/*" />
            </div>

            <div className="username-edit-div">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" placeholder="current_username" />
            </div>

            <div className="aboutyou-edit-div">
              <label htmlFor="aboutyou-edit">About you</label>
              <textarea id="aboutyou-edit" maxLength={70}></textarea>
            </div>

            <div className="gender-div">
              <label htmlFor="gender">Gender</label>
              <select id="gender">
                <option value="" disabled hidden>-- Select Gender --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

          </fieldset>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </section>
    </div>
  );
}