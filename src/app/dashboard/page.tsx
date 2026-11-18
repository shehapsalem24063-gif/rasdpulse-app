"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const riskColor = overallRisk >= 70 ? "#f87171" : overallRisk >= 40 ? "#facc15" : "#4ade80";

  return (
    <div style={{ minHeight: "100vh", background: "#030712" }} dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", background: "rgba(11,18,32,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "#030712", fontSize: 18
            }}>R</div>
            <div>
              <h1 className="rp-gradient-text" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>RasdPulse</h1>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{user?.name} ({user?.role})</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setLocale("en")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: locale === "en" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "en" ? "#22d3ee" : "#64748b", cursor: "pointer", fontSize: 12 }}>EN</button>
              <button onClick={() => setLocale("ar")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: locale === "ar" ? "rgba(34,211,238,0.2)" : "transparent", color: locale === "ar" ? "#22d3ee" : "#64748b", cursor: "pointer", fontSize: 12 }}>عربي</button>
            </div>
            <Link href="/settings" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #1e293b", color: "#e2e8f0", fontSize: 13, textDecoration: "none" }}>{t.settings}</Link>
            <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer" }}>{t.logout}</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: t.totalDevices, value: nodes.length, color: "#e2e8f0" },
            { label: t.activeDevices, value: activeCount, color: "#4ade80" },
            { label: t.criticalAlerts, value: criticalCount, color: "#f87171" },
            { label: t.overallRisk, value: overallRisk + "%", color: riskColor },
          ].map((s) => (
            <div key={s.label} className="rp-card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Devices header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{t.devices}</h2>
          <button onClick={loadData} disabled={loading} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(34,211,238,0.3)",
            background: "rgba(34,211,238,0.1)", color: "#22d3ee", fontSize: 13, cursor: "pointer"
          }}>{loading ? "..." : t.refresh}</button>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#facc15", fontSize: 14 }}>
            {error}
            <div style={{ marginTop: 8 }}>
              <Link href="/settings">{t.connectGNS3} →</Link>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rp-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr style={{ background: "#0a0f1a" }}>
                  <th>{t.devices}</th>
                  <th>Type</th>
                  <th>{t.status}</th>
                  <th>{t.risk}</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {risks.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                      {t.noData}
                    </td>
                  </tr>
                )}
                {risks.map((r) => (
                  <tr key={r.node_id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ color: "#94a3b8" }}>{nodes.find((n) => n.node_id === r.node_id)?.node_type || "—"}</td>
                    <td>
                      <span className={`rp-badge ${r.status === "started" ? "rp-badge-green" : r.status === "stopped" ? "rp-badge-red" : "rp-badge-yellow"}`}>
                        {r.status === "started" ? t.started : r.status === "stopped" ? t.stopped : r.status}
                      </span>
                    </td>
                    <td>
                      <span className={`rp-badge rp-badge-${r.riskLevel}`}>{t[r.riskLevel]}</span>
                    </td>
                    <td style={{ fontFamily: "monospace" }}>{r.riskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {lastUpdate && (
          <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#64748b" }}>
            {t.lastUpdate}: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </main>
    </div>
  );
}
