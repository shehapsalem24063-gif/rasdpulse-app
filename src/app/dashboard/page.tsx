"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { translations, type Locale } from "@/i18n/translations";
import { calculateRisk, type GNS3Node, type DeviceRisk } from "@/lib/gns3";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];
  const [user, setUser] = useState<UserInfo | null>(null);
  const [nodes, setNodes] = useState<GNS3Node[]>([]);
  const [risks, setRisks] = useState<DeviceRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        loadData();
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gns3/nodes");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.noData);
        setNodes([]);
        setRisks([]);
      } else {
        const nodeList: GNS3Node[] = data.nodes || [];
        setNodes(nodeList);
        setRisks(nodeList.map(calculateRisk));
        setLastUpdate(new Date());
      }
    } catch {
      setError(t.noData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const activeCount = nodes.filter((n) => n.status === "started").length;
  const criticalCount = risks.filter((r) => r.riskLevel === "critical" || r.riskLevel === "high").length;
  const overallRisk = risks.length === 0 ? 0 : Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length);
  const riskColor = overallRisk >= 70 ? "text-red-400" : overallRisk >= 40 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="min-h-screen bg-[#050505]" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-[#1a2a4a] bg-[#0c1222]/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.appName}</h1>
              <p className="text-xs text-gray-500">{user?.name} ({user?.role})</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button onClick={() => setLocale("en")} className={`px-2 py-1 text-xs rounded ${locale === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>EN</button>
              <button onClick={() => setLocale("ar")} className={`px-2 py-1 text-xs rounded ${locale === "ar" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}>عربي</button>
            </div>
            <Link href="/settings" className="px-3 py-1.5 text-sm rounded-lg border border-[#1a2a4a] hover:border-cyan-500/50 transition">{t.settings}</Link>
            <button onClick={handleLogout} className="px-3 py-1.5 text-sm rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition">{t.logout}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{t.totalDevices}</p>
            <p className="text-2xl font-bold">{nodes.length}</p>
          </div>
          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{t.activeDevices}</p>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          </div>
          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{t.criticalAlerts}</p>
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
          </div>
          <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{t.overallRisk}</p>
            <p className={`text-2xl font-bold ${riskColor}`}>{overallRisk}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t.devices}</h2>
          <button onClick={loadData} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50">{loading ? "..." : t.refresh}</button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
            {error}
            <div className="mt-2"><Link href="/settings" className="text-cyan-400 underline">{t.connectGNS3} →</Link></div>
          </div>
        )}

        <div className="bg-[#0c1222] border border-[#1a2a4a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a0f1a] text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t.devices}</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">{t.status}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.risk}</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {risks.length === 0 && !loading && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">{t.noData}</td></tr>
                )}
                {risks.map((r) => (
                  <tr key={r.node_id} className="border-t border-[#1a2a4a] hover:bg-[#0a0f1a]/50">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-gray-400">{nodes.find((n) => n.node_id === r.node_id)?.node_type || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${r.status === "started" ? "bg-green-500/15 text-green-400" : r.status === "stopped" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                        {r.status === "started" ? t.started : r.status === "stopped" ? t.stopped : r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium risk-${r.riskLevel}`}>{t[r.riskLevel]}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{r.riskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {lastUpdate && <p className="mt-4 text-xs text-gray-500 text-center">{t.lastUpdate}: {lastUpdate.toLocaleTimeString()}</p>}
      </main>
    </div>
  );
}
