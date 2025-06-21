// const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node'); // We'll mock this
const winston = require('winston');

// Mock Clerk Middleware for testing without a real key
const ClerkExpressWithAuth = () => (req, res, next) => {
  req.auth = {
    userId: 'user_mock_12345',
    user: {
      publicMetadata: {
        role: 'admin' // Assume admin for testing
      }
    }
  };
  next();
};
const ClerkExpressRequireAuth = ClerkExpressWithAuth;

// Mock Supabase client for now
const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ error: null }),
    eq: () => ({ data: null, error: null }),
    contains: () => ({ data: [], error: null }),
    single: () => ({ data: null, error: null }),
    rpc: () => ({ data: [], error: null }),
    raw: () => 'mock_raw_query'
  })
};

// Logger
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
});

// Clerk middleware for role check
function requireRole(role) {
  return async (req, res, next) => {
    // Check the role from our mock user
    const mockRole = req.auth?.user?.publicMetadata?.role;
    if (mockRole !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

// Mock cache helpers
const mockCache = new Map();

async function getCache(key) {
  const cached = mockCache.get(key);
  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.value;
  }
  mockCache.delete(key);
  return null;
}

async function setCache(key, value, ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  mockCache.set(key, { value, expires_at: expiresAt });
}

// Mock audit trail helper
async function logAuditTrail(table, id, action, userId, details) {
  logger.info('Audit trail logged', { table, id, action, userId, details });
  // In production, this would save to the database
}

module.exports = {
  supabase,
  logger,
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  requireRole,
  getCache,
  setCache,
  logAuditTrail,
}; 