import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export async function POST(req)
{
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('pending_2fa_user');

    return NextResponse.json({
      success: true,
      message: ['Logged out successfully']
    });
  }
  catch (error)
  {
    console.error('Logout error: ', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}