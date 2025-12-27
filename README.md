# UBL Console / Messenger

A WhatsApp-like interface for the Universal Business Logic (UBL) Console, providing secure command and control with transparency and auditability.

## 🎯 What is the Console UBL?

The Console is the command center for UBL. Here you approve what will happen (with security), trigger actions, and track results. It doesn't execute anything on its own — who commands is the UBL (law/ledger) and who executes is the Runner (Office). The Console only orchestrates, with total transparency.

## 🚀 How to Use (3 Steps)

### 1. Open a Card
View action, target, parameters, risk (L0–L5), policy_hash, subject_hash, diff, and TTL.

### 2. Approve
- **L0–L2**: Click Approve
- **L3**: Hold to approve (3 seconds)
- **L4–L5**: WebAuthn (and quorum if requested)

The Console requests a Permit from UBL and issues a Command.

### 3. Track
- **Pending**: Queue of pending commands
- **Receipts**: Signed results with logs_hash and artifacts

## 📋 Key Features

### Frontend (Messenger)

**Essential:**
- **Home/Panel**: Pending items + recent receipts, filter by tenant/target
- **Approval Card**: Readable summary + diff, risk badge (L0–L5), TTL countdown, params toggle, link to "view canonical JSON"
- **Step-up WebAuthn**: Modal with hold-to-approve and plan confirmation (Admin blue)
- **Issue**: Calls `POST /v1/policy/permit` → then `POST /v1/commands/issue`
- **Results**: ResultCard with status, usage, artifacts[], logs_hash, timestamps

**Lists & Details:**
- **Pending** (commands.pending): Table with jobType, target, risk, age, jti
- **Receipts**: History + detail (ret.summary, logs_hash, artifacts)
- **Allowlist** (read-only): Catalog of valid actions per Office/tenant

**Identity & Context:**
- **Blue Banner** (Active Admin): Always visible with active Office, tenant, policy_hash, Admin TTL
- **Tenant and target selectors** (LAB 512/256/8GB)
- **Visible Actor** (who signs)

**Security/UX:**
- Hold-to-approve for L3+; step-up L4/L5 (and quorum when required)
- Button blocked if TTL expired / step-up missing / target out of scope

**Observability:**
- Toasts with clickable ID (jti)
- Mini-console: permit_id, command.jti, exec_id
- Open JSONs (Card/Receipt) in dedicated view

**States & a11y:**
- Empty states, network error, TTL expired (CTA "Re-approve Admin")
- a11y in modals
- Keyboard shortcuts: **A** (approve), **V** (JSON), **D** (diff)
- i18n support, dark mode

### Backend API

**Endpoints:**

```
GET  /api/health                         # Health check
GET  /api/v1/participants                # List participants (humans + agents)
POST /api/v1/cards/propose               # Propose action (agent/human)
GET  /api/v1/cards/:id                   # Get card by ID
POST /api/v1/policy/permit               # Request permit from UBL
POST /api/v1/commands/issue              # Issue command
GET  /api/v1/query/commands              # Query commands (pending/all)
POST /api/v1/exec.finish                 # Finish execution, create receipt
GET  /api/v1/receipts                    # Get receipts
GET  /api/v1/receipts/:id                # Get receipt by ID
GET  /api/v1/allowlist                   # Get allowlist (read-only)
GET  /api/v1/policy/manifest             # Get policy manifest
POST /api/v1/auth/webauthn/challenge     # WebAuthn challenge
POST /api/v1/auth/webauthn/verify        # WebAuthn verify
```

## 🔧 Development

### Prerequisites
- Node.js >= 18.x

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danvoulez/messenger-design)

### Manual Deploy
```bash
vercel
```

## 🏗️ Architecture

### Flow
```
Card → Permit → Command → Receipt
```

1. **Card**: Proposed action (by human or agent)
2. **Permit**: Approval from UBL policy engine
3. **Command**: Issued command to Runner
4. **Receipt**: Signed execution result

### Components

- **UBL (LAB 256)**: Policy engine, ledger, permits
- **Runner (LAB 512)**: Pull-only executor, sandboxed
- **Console/Messenger**: UI for orchestration

### Security Model

- **Risk Levels**:
  - L0: Trivial (auto)
  - L1: Low (click)
  - L2: Medium (click)
  - L3: High (hold 3s)
  - L4: Critical (WebAuthn)
  - L5: Maximum (WebAuthn + quorum)

- **Allowlist Only**: No wildcards, no shell injection
- **Immutable Trail**: All actions logged with hashes
- **TTL**: Time-limited admin sessions
- **Step-up**: WebAuthn for critical operations

## 👥 Humans and Agents

Both humans and agents appear in the same participant list:

```json
{
  "id": "U.123" | "A.office:cluster.operator",
  "type": "human" | "agent",
  "display_name": "Dan" | "Office/Cluster Operator",
  "tenant_id": "T.UBL",
  "roles": ["admin","operator","viewer"],
  "risk_ceiling": "L0–L5",
  "capabilities": ["propose","simulate","execute:L0-L2"],
  "presence": "online|idle|off",
  "verified": true
}
```

### Rules
- Everything goes through UBL
- Agent cannot approve ≥ L3
- Agent proposes/simulates; human approves by risk
- Risk ceiling per participant
- Automatic escalation to human for L3+
- Single trail: `proposed_by → approved_by → executed_by` in same jti

## 📁 Project Structure

```
.
├── api/
│   └── index.js          # Express API server
├── public/
│   └── index.html        # Frontend SPA
├── server.js             # Dev server
├── package.json          # Dependencies
├── vercel.json           # Vercel config
└── README.md             # This file
```

## 🎨 Design Philosophy

**WhatsApp-like** because:
- Card → Permit → Command → Receipt in same chat thread
- Passkey/step-up in-thread (and quorum)
- Plan with hash: "Approve" button tied to subject_hash/policy_hash
- Operational allowlist (safe and clear actions)
- Explicit tenant & target (no ambiguity)
- Runner pull-only (safe execution in LAB 512)
- Readable diff + canonical JSON side by side
- Immutable audit (ledger)
- Fractal (same rules in all tenants)
- Brain plugged in (LLM proposes; human decides)

## 📝 License

MIT

## 🔗 Links

- [LogLine Foundation](https://logline.foundation)
- [UBL Documentation](https://ubl.logline.foundation)

---

Built with ❤️ by the LogLine Foundation team
