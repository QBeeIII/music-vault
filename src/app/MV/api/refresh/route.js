import { NextResponse } from 'next/server';
import { createAccessToken, createRefreshToken, getAccessTokenExpiry, getRefreshTokenExpiry, verifyJwt } from '../../lib/jwt';
import { enforceRateLimit, clearRateLimit, getClientIp } from '../../lib/auth';

export async function POST(req) {
  const ip = getClientIp(req);
  const rateLimitKey = `refresh:${ip}`;
  const rateLimitError = enforceRateLimit(rateLimitKey, 10, 60 * 60);

  if (rateLimitError) {
    return NextResponse.json({ message: [rateLimitError] }, { status: 429 });
  }

  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    const res = NextResponse.json({ message: ['Refresh token missing'] }, { status: 401 });
    res.cookies.delete('auth_token');
    res.cookies.delete('refresh_token');
    return res;
  }

  const payload = verifyJwt(refreshToken);
  if (!payload || payload.tokenType !== 'refresh') {
    const res = NextResponse.json({ message: ['Invalid or expired refresh token'] }, { status: 401 });
    res.cookies.delete('auth_token');
    res.cookies.delete('refresh_token');
    return res;
  }

  const accessToken = createAccessToken({ sub: payload.sub, username: payload.username });
  const newRefreshToken = createRefreshToken({ sub: payload.sub, username: payload.username });

  const res = NextResponse.json({ success: true, message: ['Session refreshed'] });

  res.cookies.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: getAccessTokenExpiry()
  });

  res.cookies.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: getRefreshTokenExpiry()
  });

  clearRateLimit(rateLimitKey);
  return res;
}
