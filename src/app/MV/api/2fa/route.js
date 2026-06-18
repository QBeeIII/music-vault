import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export async function POST(req)
{
  //handle both setup and usage here

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
    console.error(': ', error);
    return NextResponse.json(
      { success: false, message: [''] },
      { status: 500 }
    )
  }
}