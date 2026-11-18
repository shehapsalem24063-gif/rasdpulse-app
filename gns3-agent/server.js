/**
 * RasdPulse GNS3 Agent
 * --------------------
 * Runs INSIDE the VMware VM that hosts GNS3.
 * Talks to local GNS3 API (usually http://127.0.0.1:3080)
 * and exposes a protected API that the Vercel app can call.
 *
 * Recommended exposure method: Cloudflare Tunnel (free & secure)
 *   cloudflared tunnel --url http://localhost:4100
 */

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 4100;
const API_KEY = process.env.AGENT_API_KEY || "rasdpulse-agent-key";
const GNS3_URL = process.env.GNS3_URL || "http://127.0.0.1:3080";
const GNS3_USER = process.env.GNS3_USER || "";
const GNS3_PASS = process.env.GNS3_PASS || "";

app.use(cors());
app.use(express.json());

// Simple API key auth
function auth(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Invalid API Key" });
  }
  next();
}

async function gns3Fetch(path, options = {}) {
  const url = `${GNS3_URL.replace(/\/$/, "")}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (GNS3_USER && GNS3_PASS) {
    const basic = Buffer.from(`${GNS3_USER}:${GNS3_PASS}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GNS3 ${res.status}: ${text}`);
  }
  return res.json();
}

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "rasdpulse-gns3-agent", gns3: GNS3_URL });
});

// List projects
app.get("/projects", auth, async (req, res) => {
  try {
    const data = await gns3Fetch("/v2/projects");
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Nodes of a project
app.get("/projects/:projectId/nodes", auth, async (req, res) => {
  try {
    const data = await gns3Fetch(`/v2/projects/${req.params.projectId}/nodes`);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Links of a project
app.get("/projects/:projectId/links", auth, async (req, res) => {
  try {
    const data = await gns3Fetch(`/v2/projects/${req.params.projectId}/links`);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Start a node
app.post("/projects/:projectId/nodes/:nodeId/start", auth, async (req, res) => {
  try {
    const data = await gns3Fetch(
      `/v2/projects/${req.params.projectId}/nodes/${req.params.nodeId}/start`,
      { method: "POST" }
    );
    res.json(data || { ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Stop a node
app.post("/projects/:projectId/nodes/:nodeId/stop", auth, async (req, res) => {
  try {
    const data = await gns3Fetch(
      `/v2/projects/${req.params.projectId}/nodes/${req.params.nodeId}/stop`,
      { method: "POST" }
    );
    res.json(data || { ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n RasdPulse GNS3 Agent running on http://0.0.0.0:${PORT}`);
  console.log(`  Proxying to GNS3 at ${GNS3_URL}`);
  console.log(`  API Key: ${API_KEY}`);
  console.log(`\n  Recommended: expose with Cloudflare Tunnel:`);
  console.log(`    cloudflared tunnel --url http://localhost:${PORT}\n`);
});
