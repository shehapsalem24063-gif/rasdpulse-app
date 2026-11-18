"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translations, type Locale } from "@/i18n/translations";

export default function SettingsPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];
  const [agentUrl, setAgentUrl] = useState("");
  const [agentKey, setAgentKey] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChat, setTelegramChat] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (!data.user) router.push("/login");
    });
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (data.agentUrl) setAgentUrl(data.agentUrl);
      if (data.agentKey) setAgentKey(data.agentKey);
      if (data.telegramChat) setTelegramChat(data.telegramChat);
    }).catch(() => {});
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentUrl, agentKey, telegramToken, telegramChat }),
      });
      const data = await res.json();
      if (res.ok) setMessage(t.settingsSaved);
      else setMessage(data.error || "Error");
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030712" }} dir={locale === "ar" ? "rtl" : "ltr"}>
      <header style={{ borderBottom: "1px solid #1e293b", background: "rgba(11,18,32,0.9)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "#030712", fontSize: 16
            }}>R</div>
            <h1 className="rp-gradient-text" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.settings}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setLocale("en")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: locale === "en" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "en" ? "#22d3ee" : "#64748b", cursor: "pointer", fontSize: 12 }}>EN</button>
            <button onClick={() => setLocale("ar")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: locale === "ar" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "ar" ? "#22d3ee" : "#64748b", cursor: "pointer", fontSize: 12 }}>عربي</button>
            <Link href="/dashboard" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #1e293b", color: "#e2e8f0", fontSize: 13, textDecoration: "none" }}>{t.dashboard}</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="rp-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#22d3ee", margin: "0 0 16px" }}>{t.connectGNS3}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.agentUrl}</label>
                <input type="url" value={agentUrl} onChange={(e) => setAgentUrl(e.target.value)} placeholder="https://xxxx.trycloudflare.com" className="rp-input" />
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>رابط الـ Agent (Cloudflare Tunnel)</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.agentKey}</label>
                <input type="text" value={agentKey} onChange={(e) => setAgentKey(e.target.value)} placeholder="rasdpulse-agent-key" className="rp-input" />
              </div>
            </div>
          </div>

          <div className="rp-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#22d3ee", margin: "0 0 16px" }}>Telegram Alerts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.telegramToken}</label>
                <input type="text" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} placeholder="123456:ABC-DEF..." className="rp-input" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{t.telegramChat}</label>
                <input type="text" value={telegramChat} onChange={(e) => setTelegramChat(e.target.value)} placeholder="-1001234567890" className="rp-input" />
              </div>
            </div>
          </div>

          {message && (
            <div style={{
              padding: 12, borderRadius: 10, fontSize: 14,
              background: message.includes("success") || message.includes("نجاح") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: message.includes("success") || message.includes("نجاح") ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)",
              color: message.includes("success") || message.includes("نجاح") ? "#4ade80" : "#f87171"
            }}>{message}</div>
          )}

          <button type="submit" disabled={loading} className="rp-btn-primary" style={{ width: "100%" }}>
            {loading ? "..." : t.save}
          </button>
        </form>
      </main>
    </div>
  );
}
