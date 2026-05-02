"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.username);
        router.push("/feed");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout auth-body">
      <section className="auth-section">
        <div className="banner-content">
          <img src="/media/logo.png" alt="CAMDEE" className="platform-logo" />
          <p className="platform-slogan">Connect with Friends</p>
        </div>
      </section>

      <section className="register-section">
        <div className="form-card">
          <header className="form-header">
            <h2>Create Account</h2>
            <p>Start your journey</p>
          </header>
          <form className="forms" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "red", textAlign: "center", margin: 0 }}>{error}</p>
            )}
            <div className="input-style">
              <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="input-style">
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="input-style">
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="input-style">
              <input type="password" name="confirm" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <footer className="form-footer">
            <p>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}