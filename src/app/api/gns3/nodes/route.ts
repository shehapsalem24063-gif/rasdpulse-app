import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchFromAgent } from "@/lib/gns3";

let runtimeSettings = {
  agentUrl: process.env.GNS3_AGENT_URL || "",
  agentKey: process.env.GNS3_AGENT_KEY || "rasdpulse-agent-key",
  projectId: process.env.GNS3_PROJECT_ID || "",
};

export function updateSettings(s: Partial<typeof runtimeSettings>) {
  runtimeSettings = { ...runtimeSettings, ...s };
}

export function getSettings() {
  return runtimeSettings;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentUrl, agentKey, projectId } = runtimeSettings;

  if (!agentUrl) {
    return NextResponse.json(
      { error: "GNS3 Agent not configured. Go to Settings and set the Agent URL." },
      { status: 400 }
    );
  }

  try {
    let pid = projectId;
    if (!pid) {
      const projects = await fetchFromAgent(agentUrl, agentKey, "/projects");
      const opened = (projects as any[]).find((p) => p.status === "opened");
      if (!opened) {
        return NextResponse.json(
          { error: "No opened project found in GNS3. Open a project first." },
          { status: 404 }
        );
      }
      pid = opened.project_id;
    }

    const nodes = await fetchFromAgent(agentUrl, agentKey, `/projects/${pid}/nodes`);
    return NextResponse.json({ nodes, projectId: pid });
  } catch (err: any) {
    console.error("GNS3 fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reach GNS3 Agent" },
      { status: 502 }
    );
  }
}
