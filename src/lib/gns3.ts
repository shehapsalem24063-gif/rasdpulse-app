export interface GNS3Node {
  node_id: string;
  name: string;
  node_type: string;
  status: "started" | "stopped" | "suspended" | string;
  console?: number;
  x?: number;
  y?: number;
  properties?: Record<string, any>;
  ports?: any[];
}

export interface GNS3Link {
  link_id: string;
  nodes: Array<{
    node_id: string;
    adapter_number: number;
    port_number: number;
  }>;
  link_type: string;
  suspend?: boolean;
}

export interface GNS3Project {
  project_id: string;
  name: string;
  status: "opened" | "closed";
}

export interface DeviceRisk {
  node_id: string;
  name: string;
  status: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

export function calculateRisk(node: GNS3Node): DeviceRisk {
  let score = 0;
  const reasons: string[] = [];

  if (node.status === "stopped") {
    score += 70;
    reasons.push("Device is stopped");
  } else if (node.status === "suspended") {
    score += 40;
    reasons.push("Device is suspended");
  } else if (node.status !== "started") {
    score += 50;
    reasons.push(`Unknown status: ${node.status}`);
  }

  const nameLower = node.name.toLowerCase();
  if (
    nameLower.includes("forti") ||
    nameLower.includes("firewall") ||
    nameLower.includes("fw") ||
    nameLower.includes("asa") ||
    nameLower.includes("palo")
  ) {
    if (node.status !== "started") {
      score += 25;
      reasons.push("Critical security device is offline");
    }
  }

  score = Math.min(100, score);

  let riskLevel: DeviceRisk["riskLevel"] = "low";
  if (score >= 80) riskLevel = "critical";
  else if (score >= 55) riskLevel = "high";
  else if (score >= 30) riskLevel = "medium";

  return {
    node_id: node.node_id,
    name: node.name,
    status: node.status,
    riskScore: score,
    riskLevel,
    reasons,
  };
}

export async function fetchFromAgent(
  agentUrl: string,
  apiKey: string,
  path: string
) {
  const url = `${agentUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agent error ${res.status}: ${text}`);
  }

  return res.json();
}
