"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      if (data.telegramToken) setTelegramToken(data.telegramToken);
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
    <div className="min-h-screen bg-[#050505]" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-[#1a2a4a] bg-[#0c1222]/70 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={36} height={36} />
            <h1 className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.settings}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLocale("en")} className={`px-2 py-1 text-xs rounded ${locale === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>EN</button>
            <button onClick={() => setLocale("ar")} className={`px-2 py-1 text-xs rounded ${locale === "ar" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>عربي</button>
            <Link href="/dashboard" className="px-3 py-1.5 text-sm rounded-lg border border-[#1a2a4a] hover:border-cyan-500/50">{t.dashboard}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400">{t.connectGNS3}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.agentUrl}</label>
                <input type="url" value={agentUrl} onChange={(e) => setAgentUrl(e.target.value)} placeholder="https://your-agent.example.com" className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none" />
                <p className="text-xs text-gray-500 mt-1">URL of the GNS3 Agent (use Cloudflare Tunnel)</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.agentKey}</label>
                <input type="text" value={agentKey} onChange={(e) => setAgentKey(e.target.value)} placeholder="rasdpulse-agent-key" className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400">Telegram Alerts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.telegramToken}</label>
                <input type="text" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} placeholder="123456:ABC-DEF..." className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.telegramChat}</label>
                <input type="text" value={telegramChat} onChange={(e) => setTelegramChat(e.target.value)} placeholder="-1001234567890" className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes("success") || message.includes("نجاح") ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400"}`}>{message}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50">{loading ? "..." : t.save}</button>
        </form>
      </main>
    </div>
  );
}
