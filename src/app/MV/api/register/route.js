import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import db from '../../db/database';
import { createAccessToken, createRefreshToken, getAccessTokenExpiry, getRefreshTokenExpiry } from '../../lib/jwt';
import { enforceRateLimit, clearRateLimit, validateRegisterPayload, getClientIp } from '../../lib/auth';

export async function POST(req) {
  const formData = await req.json();
  const username = formData.username;
  const password = formData.passA;
  const passwordB = formData.passB;
  const ip = getClientIp(req);
  const rateLimitKey = `register:${ip}`;
  const rateLimitError = enforceRateLimit(rateLimitKey, 3, 60 * 10);

  if (rateLimitError) {
    return NextResponse.json({ message: [rateLimitError] }, { status: 429 });
  }

  const validationErrors = validateRegisterPayload(username, password, passwordB);
  if (validationErrors.length > 0) {
    return NextResponse.json({ message: validationErrors }, { status: 400 });
  }

  try {
    const dupes = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username]
    });
    const dupeRow = dupes.rows[0];

    if (dupeRow) {
      return NextResponse.json({ message: ['Username already taken.'] }, { status: 400 });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const insert = await db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [username, hashPass]
    });

    const newID = Number(insert.lastInsertRowid);
    const accessToken = createAccessToken({ sub: newID.toString(), username });
    const refreshToken = createRefreshToken({ sub: newID.toString(), username });

    const res = NextResponse.json({
      success: true,
      message: ['User successfully created.']
    }, { status: 201 });

    res.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getAccessTokenExpiry()
    });

    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: getRefreshTokenExpiry()
    });

    clearRateLimit(rateLimitKey);
    return res;
  } catch (error) {
    console.error('registration error:', error);
    return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
  }
}
