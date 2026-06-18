import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
//import db from '../../db/database'

//local db so i dont spend credits
import { createClient } from '@libsql/client';
import path from 'path';
const dbPath = path.join(process.cwd(), 'src', 'app', 'MV', 'music-vault.db');
const db = createClient({
  url: `file:${dbPath}`
});


export async function POST(req)
{
  const formData = await req.json();
  const username = formData.username;
  const password = formData.password;


  try
  {
    const search = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username]
      });
    
    //user DNE
    if (search.rows.length == 0)
    {
      return NextResponse.json({message: ["Username or password is incorrect, please try again."]}, {status: 401});
    }

    const user = search.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
    {
      return NextResponse.json({message: ["Username or password is incorrect, please try again."]}, {status: 401});
    }

    const res = NextResponse.json({
      success: true,
      message: ["Login successful."],
    }, {status: 200});

    res.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: false, //change for prod
      sameSite: 'lax',
      maxAge: 60*60*24*7
    });

    return res;
  }
  catch (error)
  {
    console.error('login error:', error);
    return NextResponse.json({message: ["An unknown error occurred. Please try again."]}, {status: 500});
  }

}