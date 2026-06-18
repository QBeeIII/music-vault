import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyJwt } from '../../../lib/jwt';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const payload = verifyJwt(authToken);
    const id = payload?.sub;

    if (!id) {
      return NextResponse.json({ message: ['User not authenticated'] }, { status: 401 });
    }

    const secret = speakeasy.generateSecret({
      name: 'Music Vault',
      length: 20,
      issuer: 'MusicVault'
    });

    try {
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      const res = NextResponse.json({
        success: true,
        qrCode: qrCode,
        message: ["QR generated successfully."],
      }, { status: 200 });

      res.cookies.set('temp_2fa_secret', secret.base32, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60
      });

      return res;
    } catch (error) {
      console.error('QR generation error:', error);
      return NextResponse.json(
        { message: ["Failed to generate QR code."] }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('login error:', error);
    return NextResponse.json(
      { message: ["An unknown error occurred. Please try again."] }, 
      { status: 500 }
    );
  }
}