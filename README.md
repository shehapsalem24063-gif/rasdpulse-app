# RasdPulse

**Real-time GNS3 Network Pulse Monitoring**

- Bilingual (English + Arabic)
- Full user system (Register / Login / Roles: Admin, Operator, Viewer)
- Device status + Risk scoring
- Telegram critical alerts
- Secure Agent architecture for GNS3 (runs inside your VMware VM)

Logo included.

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Vercel (Next.js)   │  HTTPS  │  GNS3 Agent          │  local  │  GNS3 Server    │
│  RasdPulse Web App  │ ──────► │  (inside VMware VM)  │ ──────► │  :3080          │
│  Login + Dashboard  │         │  Port 4100 + API Key │         │  Projects/Nodes │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
```

The web app never talks directly to GNS3. It talks only to the **Agent**.  
This is safer and works even when GNS3 is behind NAT / VMware.

---

## 1. Run the GNS3 Agent (inside the VMware VM)

```bash
cd gns3-agent
npm install
# Optional environment variables:
# GNS3_URL=http://127.0.0.1:3080
# AGENT_API_KEY=your-strong-key
# GNS3_USER=gns3          (if auth enabled on GNS3)
# GNS3_PASS=gns3
npm start
```

The agent listens on port **4100**.

### Expose the Agent to the internet (recommended)

**Best option – Cloudflare Tunnel (free):**

```bash
# Install cloudflared then:
cloudflared tunnel --url http://localhost:4100
```

You will get a public HTTPS URL like `https://xxxx.trycloudflare.com`.  
Put this URL in the RasdPulse Settings page as **Agent URL**.

Alternatively use ngrok, a reverse proxy, or port-forward with strong firewall rules.

---

## 2. Run / Deploy the Web App

### Local development

```bash
cd rasdpulse
npm install
# Optional:
# JWT_SECRET=change-me
npm run dev
```

Open http://localhost:3000

**Default admin account:**
- Email: `admin@rasdpulse.com`
- Password: `admin123`

### Deploy to Vercel

1. Push the project to GitHub
2. Import in Vercel
3. Add environment variables if needed (`JWT_SECRET`)
4. Deploy

After deploy, go to **Settings** inside the app and paste:
- GNS3 Agent URL (the Cloudflare Tunnel URL)
- Agent API Key (must match the one used by the agent)
- Telegram Bot Token + Chat ID (optional)

---

## 3. Telegram Alerts

1. Talk to [@BotFather](https://t.me/BotFather) → create a bot → copy the token
2. Start a chat with your bot or add it to a group
3. Get the Chat ID (you can use `@userinfobot` or the getUpdates method)
4. Paste both values in RasdPulse Settings

Critical / high-risk devices can then trigger messages.

---

## 4. Connecting GNS3 lab to your real network

Inside GNS3:

1. Add a **Cloud** node (or NAT)
2. Bind it to the network adapter of the VMware VM that has access to your physical network / LAN
3. Connect your routers / FortiGate to that Cloud node

This way the emulated devices can reach real servers and vice-versa (depending on routing and firewall rules).

---

## 5. GNS3 Server configuration tips

In the GNS3 VM edit the server config (usually `/opt/gns3/server/gns3_server.conf` or `~/.config/GNS3/.../gns3_server.conf`):

```ini
[Server]
host = 0.0.0.0
port = 3080
auth = True          # recommended
user = gns3
password = strongpassword
```

Restart the GNS3 server after changes.

---

## Security notes

- Never expose the raw GNS3 API (port 3080) to the public internet.
- Always put the Agent behind Cloudflare Tunnel / reverse proxy with the API key.
- Change the default admin password after first login.
- Change `JWT_SECRET` and `AGENT_API_KEY` in production.

---

## Tech stack

- Next.js 16 (App Router)
- Tailwind CSS
- JWT auth (jose + bcryptjs)
- Express Agent for GNS3 proxy
- Ready for Vercel

---

Made for real GNS3 labs running inside VMware with FortiGate and other emulated appliances.
