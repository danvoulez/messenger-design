const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (for demo purposes)
const storage = {
  permits: [],
  commands: [],
  receipts: [],
  participants: [
    {
      id: "U.001",
      type: "human",
      display_name: "Dan",
      tenant_id: "T.UBL",
      roles: ["admin", "operator"],
      risk_ceiling: "L5",
      capabilities: ["propose", "simulate", "execute:L0-L5"],
      presence: "online",
      verified: true,
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=dan&backgroundColor=f5f5f5"
    },
    {
      id: "A.office:core.operator",
      type: "agent",
      display_name: "Core Agent",
      tenant_id: "T.UBL",
      roles: ["operator", "viewer"],
      risk_ceiling: "L2",
      capabilities: ["propose", "simulate", "execute:L0-L2"],
      presence: "online",
      verified: true,
      notes: "runner@LAB_512 pull-only"
    },
    {
      id: "A.office:review.analyzer",
      type: "agent",
      display_name: "Code Review Agent",
      tenant_id: "T.UBL",
      roles: ["viewer"],
      risk_ceiling: "L1",
      capabilities: ["propose", "simulate"],
      presence: "online",
      verified: true,
      notes: "Analysis only, no execution"
    }
  ],
  cards: []
};

// Helper function to create blake3 hash (mock)
function createHash(data) {
  return `blake3:${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 32)}`;
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// Get participants
app.get('/v1/participants', (req, res) => {
  const { tenant } = req.query;
  let filtered = storage.participants;
  
  if (tenant) {
    filtered = filtered.filter(p => p.tenant_id === tenant);
  }
  
  res.json({ participants: filtered });
});

// Propose a card (can be by agent or human)
app.post('/v1/cards/propose', (req, res) => {
  const {
    jobType,
    target,
    params,
    tenant_id,
    proposed_by,
    risk_level = "L0"
  } = req.body;
  
  const card = {
    id: `card_${uuidv4()}`,
    jti: `jti_${Date.now()}`,
    jobType,
    target,
    params,
    tenant_id,
    proposed_by,
    risk_level,
    policy_hash: createHash({ jobType, target, tenant_id }),
    subject_hash: createHash({ jobType, target, params }),
    status: 'pending',
    ttl: 300, // 5 minutes in seconds
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString()
  };
  
  storage.cards.push(card);
  res.status(201).json({ card });
});

// Get card by ID
app.get('/v1/cards/:id', (req, res) => {
  const card = storage.cards.find(c => c.id === req.params.id);
  
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  res.json({ card });
});

// Request permit from UBL
app.post('/v1/policy/permit', (req, res) => {
  const {
    card_id,
    actor,
    policy_hash,
    subject_hash,
    risk_level
  } = req.body;
  
  // Simulate permit logic
  const permit = {
    permit_id: `permit_${uuidv4()}`,
    card_id,
    actor,
    policy_hash,
    subject_hash,
    risk_level,
    approved: true,
    approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString()
  };
  
  storage.permits.push(permit);
  res.status(200).json({ permit });
});

// Issue a command
app.post('/v1/commands/issue', (req, res) => {
  const {
    permit_id,
    card_id,
    jobType,
    target,
    params,
    actor
  } = req.body;
  
  const permit = storage.permits.find(p => p.permit_id === permit_id);
  if (!permit) {
    return res.status(404).json({ error: 'Permit not found' });
  }
  
  const command = {
    jti: `jti_${Date.now()}`,
    permit_id,
    card_id,
    jobType,
    target,
    params,
    actor,
    status: 'pending',
    issued_at: new Date().toISOString()
  };
  
  storage.commands.push(command);
  
  // Update card status
  const card = storage.cards.find(c => c.id === card_id);
  if (card) {
    card.status = 'issued';
    card.command_jti = command.jti;
  }
  
  res.status(200).json({ command });
});

// Query commands
app.get('/v1/query/commands', (req, res) => {
  const { pending, tenant } = req.query;
  
  let filtered = storage.commands;
  
  if (pending === '1' || pending === 'true') {
    filtered = filtered.filter(c => c.status === 'pending');
  }
  
  if (tenant) {
    filtered = filtered.filter(c => {
      const card = storage.cards.find(card => card.id === c.card_id);
      return card && card.tenant_id === tenant;
    });
  }
  
  res.json({ commands: filtered });
});

// Finish execution and create receipt
app.post('/v1/exec.finish', (req, res) => {
  const {
    jti,
    status,
    summary,
    logs_hash,
    artifacts = [],
    usage = {}
  } = req.body;
  
  const command = storage.commands.find(c => c.jti === jti);
  if (!command) {
    return res.status(404).json({ error: 'Command not found' });
  }
  
  // Update command status
  command.status = status;
  command.completed_at = new Date().toISOString();
  
  // Create receipt
  const receipt = {
    receipt_id: `receipt_${uuidv4()}`,
    jti,
    status,
    summary,
    logs_hash: logs_hash || createHash({ jti, status, summary }),
    artifacts,
    usage,
    started_at: command.issued_at,
    completed_at: command.completed_at,
    duration_ms: Date.now() - new Date(command.issued_at).getTime()
  };
  
  storage.receipts.push(receipt);
  
  // Update card
  const card = storage.cards.find(c => c.command_jti === jti);
  if (card) {
    card.status = 'completed';
    card.receipt_id = receipt.receipt_id;
  }
  
  res.status(200).json({ receipt });
});

// Get receipts
app.get('/v1/receipts', (req, res) => {
  const { tenant, limit = 50 } = req.query;
  
  let filtered = storage.receipts;
  
  if (tenant) {
    filtered = filtered.filter(r => {
      const command = storage.commands.find(c => c.jti === r.jti);
      if (!command) return false;
      const card = storage.cards.find(card => card.id === command.card_id);
      return card && card.tenant_id === tenant;
    });
  }
  
  // Sort by completion time, newest first
  filtered = filtered.sort((a, b) => 
    new Date(b.completed_at) - new Date(a.completed_at)
  ).slice(0, parseInt(limit));
  
  res.json({ receipts: filtered });
});

// Get receipt by ID
app.get('/v1/receipts/:id', (req, res) => {
  const receipt = storage.receipts.find(r => r.receipt_id === req.params.id);
  
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  
  res.json({ receipt });
});

// Get allowlist (read-only)
app.get('/v1/allowlist', (req, res) => {
  const { tenant } = req.query;
  
  // Mock allowlist
  const allowlist = [
    {
      office: "OFFICE.Core",
      tenant_id: tenant || "T.UBL",
      actions: [
        { jobType: "docker.run", risk: "L2", description: "Run sandboxed container" },
        { jobType: "git.clone", risk: "L0", description: "Clone repository" },
        { jobType: "npm.install", risk: "L1", description: "Install npm packages" },
        { jobType: "build.run", risk: "L2", description: "Execute build" },
        { jobType: "test.run", risk: "L1", description: "Run test suite" },
        { jobType: "deploy.staging", risk: "L3", description: "Deploy to staging" },
        { jobType: "deploy.production", risk: "L5", description: "Deploy to production" }
      ]
    }
  ];
  
  res.json({ allowlist });
});

// Get policy manifest
app.get('/v1/policy/manifest', (req, res) => {
  const manifest = {
    version: "2.0.0",
    policy_hash: createHash({ version: "2.0.0", tenant: "T.UBL" }),
    tenant: "T.UBL",
    risk_levels: {
      L0: { name: "Trivial", approval: "auto", hold_time: 0 },
      L1: { name: "Low", approval: "click", hold_time: 0 },
      L2: { name: "Medium", approval: "click", hold_time: 0 },
      L3: { name: "High", approval: "hold", hold_time: 3000 },
      L4: { name: "Critical", approval: "webauthn", hold_time: 0 },
      L5: { name: "Maximum", approval: "webauthn+quorum", hold_time: 0 }
    },
    quorum: {
      L5: { required: 2, timeout: 300 }
    },
    published_at: new Date().toISOString()
  };
  
  res.json({ manifest });
});

// Simulate WebAuthn challenge
app.post('/v1/auth/webauthn/challenge', (req, res) => {
  const challenge = {
    challenge_id: `challenge_${uuidv4()}`,
    challenge: Buffer.from(uuidv4()).toString('base64'),
    expires_at: new Date(Date.now() + 60000).toISOString()
  };
  
  res.json({ challenge });
});

// Verify WebAuthn response
app.post('/v1/auth/webauthn/verify', (req, res) => {
  const { challenge_id, response } = req.body;
  
  // Mock verification (always succeeds)
  res.json({ 
    verified: true,
    step_up_token: `stepup_${uuidv4()}`,
    valid_until: new Date(Date.now() + 600000).toISOString()
  });
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 UBL Console API running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}
