"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translations, type Locale } from "@/i18n/translations";

export default function RegisterPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#030712" }}>
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
        <button onClick={() => setLocale("en")} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: locale === "en" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "en" ? "#22d3ee" : "#64748b", cursor: "pointer" }}>EN</button>
        <button onClick={() => setLocale("ar")} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: locale === "ar" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "ar" ? "#22d3ee" : "#64748b", cursor: "pointer" }}>عربي</button>
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, margin: "0 auto 16px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 800, color: "#030712",
            boxShadow: "0 0 40px rgba(34, 211, 238, 0.3)"
          }}>R</div>
          <h1 className="rp-gradient-text" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>RasdPulse</h1>
        </div>

        <form onSubmit={handleSubmit} className="rp-card" style={{ padding: 32 }} dir={locale === "ar" ? "rtl" : "ltr"}>
          <h2 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 24 }}>{t.createAccount}</h2>

          {error && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.name}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="rp-input" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rp-input" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rp-input" />
            </div>
            <button type="submit" disabled={loading} className="rp-btn-primary" style={{ width: "100%", marginTop: 8 }}>
              {loading ? "..." : t.register}
            </button>
          </div>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#64748b" }}>
            {t.alreadyHaveAccount}{" "}
            <Link href="/login">{t.login}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
