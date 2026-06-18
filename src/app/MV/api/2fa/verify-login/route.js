import speakeasy from 'speakeasy';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '../../../db/database';
import { createJwt } from '../../../lib/jwt';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const pendingUserId = cookieStore.get('pending_2fa_user')?.value;

    if (!pendingUserId) {
      return NextResponse.json({ success: false, message: ['2FA session expired. Please log in again.'] }, { status: 401 });
    }

    const data = await req.json();
    const code = data.code;

    if (!code || code.length !== 6) {
      return NextResponse.json({ success: false, message: ['Invalid verification code'] }, { status: 400 });
    }

    const userResult = await db.execute({
      sql: 'SELECT username, twofa_secret FROM users WHERE id = ?',
      args: [pendingUserId]
    });
    const user = userResult.rows[0];

    if (!user || !user.twofa_secret) {
      return NextResponse.json({ success: false, message: ['2FA login failed'] }, { status: 401 });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return NextResponse.json({ success: false, message: ['Invalid authentication code'] }, { status: 400 });
    }

    const authToken = createJwt({ sub: pendingUserId.toString(), username: user.username });
    const response = NextResponse.json({ success: true, message: ['Login successful'] });

    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    cookieStore.delete('pending_2fa_user');
    return response;
  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json({ success: false, message: ['An unexpected error occurred. Please try again.'] }, { status: 500 });
  }
}
