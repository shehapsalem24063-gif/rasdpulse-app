"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setLocale("en")} className={`px-3 py-1 rounded text-sm ${locale === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>EN</button>
        <button onClick={() => setLocale("ar")} className={`px-3 py-1 rounded text-sm ${locale === "ar" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>عربي</button>
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="RasdPulse" width={100} height={100} className="mx-auto mb-4" priority />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.appName}</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#0c1222] border border-[#1a2a4a] rounded-2xl p-8 shadow-2xl glow" dir={locale === "ar" ? "rtl" : "ltr"}>
          <h2 className="text-xl font-semibold mb-6 text-center">{t.createAccount}</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t.name}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-lg bg-[#050505] border border-[#1a2a4a] focus:border-cyan-500 focus:outline-none transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50">{loading ? "..." : t.register}</button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">{t.alreadyHaveAccount} <Link href="/login" className="text-cyan-400 hover:underline">{t.login}</Link></p>
        </form>
      </div>
    </div>
  );
}
