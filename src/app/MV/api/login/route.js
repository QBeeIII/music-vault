import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import db from '../../db/database';
import { createAccessToken, createRefreshToken, getAccessTokenExpiry, getRefreshTokenExpiry } from '../../lib/jwt';
import { enforceRateLimit, clearRateLimit, validateLoginPayload, getClientIp } from '../../lib/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const ip = getClientIp(req);
    const rateLimitKey = `login:${ip}:${username || 'unknown'}`;
    const rateLimitError = enforceRateLimit(rateLimitKey, 5, 60 * 5);

    if (rateLimitError) {
      return NextResponse.json({ message: [rateLimitError] }, { status: 429 });
    }

    const validationErrors = validateLoginPayload(username, password);
    if (validationErrors.length > 0) {
      return NextResponse.json({ message: validationErrors }, { status: 400 });
    }

    const userResult = await db.execute({
      sql: 'SELECT id, username, password, twofa_secret FROM users WHERE username = ?',
      args: [username]
    });
    
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json(
        { message: ['Invalid credentials'] },
        { status: 401 }
      );
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: ['Invalid credentials'] },
        { status: 401 }
      );
    }
    
    const twoFAEnabled = Boolean(user.twofa_secret);

    if (twoFAEnabled) {
      const response = NextResponse.json({
        success: true,
        requires2FA: true,
        message: ['2FA verification required']
      });

      response.cookies.set('pending_2fa_user', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 5
      });

      return response;
    }

    clearRateLimit(rateLimitKey);

    const accessToken = createAccessToken({ sub: user.id.toString(), username: user.username });
    const refreshToken = createRefreshToken({ sub: user.id.toString(), username: user.username });
    const response = NextResponse.json({
      success: true,
      requires2FA: false,
      message: ['Login successful']
    });

    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getAccessTokenExpiry()
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getRefreshTokenExpiry()
    });

    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: ['An unexpected error occurred. Please try again.'] },
      { status: 500 }
    );
  }
}