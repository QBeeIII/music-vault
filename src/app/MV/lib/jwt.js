import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in production. Set JWT_SECRET in Vercel environment variables.');
}
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

function base64urlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

function sign(input) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(input)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createJwt(payload, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const signature = sign(`${encodedHeader}.${encodedPayload}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);

  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encodedPayload));
  } catch (error) {
    return null;
  }

  if (typeof payload.exp !== 'number' || Math.floor(Date.now() / 1000) >= payload.exp) {
    return null;
  }

  return payload;
}

export function createAccessToken(payload) {
  return createJwt({ ...payload, tokenType: 'access' }, ACCESS_TOKEN_EXPIRY_SECONDS);
}

export function createRefreshToken(payload) {
  return createJwt({ ...payload, tokenType: 'refresh' }, REFRESH_TOKEN_EXPIRY_SECONDS);
}

export function getAccessTokenExpiry() {
  return ACCESS_TOKEN_EXPIRY_SECONDS;
}

export function getRefreshTokenExpiry() {
  return REFRESH_TOKEN_EXPIRY_SECONDS;
}
