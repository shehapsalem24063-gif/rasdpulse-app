import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, updateSettings } from "@/app/api/gns3/nodes/route";

let telegramSettings = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChat: process.env.TELEGRAM_CHAT_ID || "",
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const s = getSettings();
  return NextResponse.json({
    agentUrl: s.agentUrl,
    agentKey: s.agentKey,
    telegramToken: telegramSettings.telegramToken ? "••••••••" : "",
    telegramChat: telegramSettings.telegramChat,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "operator") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();

  if (body.agentUrl !== undefined) {
    updateSettings({
      agentUrl: body.agentUrl,
      agentKey: body.agentKey || "rasdpulse-agent-key",
    });
  }

  if (body.telegramToken !== undefined) {
    telegramSettings.telegramToken = body.telegramToken;
  }
  if (body.telegramChat !== undefined) {
    telegramSettings.telegramChat = body.telegramChat;
  }

  return NextResponse.json({ ok: true });
}

export function getTelegramSettings() {
  return telegramSettings;
}
