"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`/api/users?email=${email}`);
    const users = await res.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
    } else {
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      router.push("/feed");
    }
  } catch (err) {
    setError("Something went wrong.");
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

      <section className="form-section">
        <div className="form-card">
          <header className="form-header">
            <h2>Login</h2>
            <p>Welcome back</p>
          </header>
          <form className="forms" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "red", textAlign: "center", margin: 0 }}>{error}</p>
            )}
            <div className="input-style">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-style">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <footer className="form-footer">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register">Register here</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}