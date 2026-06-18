import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export async function POST(req)
{
  try
  {
    (await cookies()).delete('userId');

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