import speakeasy from 'speakeasy';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '../../../db/database';
import { verifyJwt } from '../../../lib/jwt';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const payload = verifyJwt(authToken);
    const id = payload?.sub;
    const tempSecret = cookieStore.get('temp_2fa_secret')?.value;

    if (!id) {
      return NextResponse.json({ success: false, message: ['User not authenticated'] }, { status: 401 });
    }

    if (!tempSecret) {
      return NextResponse.json({ success: false, message: ['2FA setup session expired. Please try again.'] }, { status: 400 });
    }

    const data = await req.json();
    const code = data.code;

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return NextResponse.json(
        { success: false, message: ['Invalid verification code'] },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "UPDATE users SET twofa_secret = ? WHERE id = ?",
      args: [tempSecret, id]
    });

    (await cookies()).delete('temp_2fa_secret');

    //TODO: implement later
    // const backupCodes = Array.from({ length: 10 }, () => 
    //   Math.floor(10000000 + Math.random() * 90000000).toString()
    // );
    // await db.execute({
    //   sql: "UPDATE users SET twofa_backup_codes = ? WHERE id = ?",
    //   args: [JSON.stringify(backupCodes), id]
    // });

    return NextResponse.json({
      success: true,
      message: ['2FA verified and enabled successfully']
      //backupCodes: backupCodes // Send backup codes to user
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: ['An unexpected error occurred'] },
      { status: 500 }
    );
  }
}