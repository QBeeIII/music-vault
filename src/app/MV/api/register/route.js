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

function validateForm(username, passwordA, passwordB)
{
  const tempErrors = [];
  if (username.length < 3 || username.length > 16)
  {
    tempErrors.push("Username must be between 3 and 16 characters.");
  }

  const userPattern = /^[a-zA-Z0-9._]+$/
  if (!userPattern.test(username))
  {
    tempErrors.push("Username contains invalid characters. Only letters, numbers, dots, and underscores are allowed.")
  }

  if (passwordA != passwordB)
  {
    tempErrors.push("Passwords do not match.");
    return tempErrors;
  }

  if (passwordA.length < 8)
  {
    tempErrors.push("Password must be at least 8 characters long.");
  }

  const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
  if (!passPattern.test(passwordA))
  {
    tempErrors.push("Password must have at least one uppercase letter, lowercase letter, number, and special character.");
  }
  return tempErrors;
}

export async function POST(req)
{
  const formData = await req.json();
  const username = formData.username;
  const password = formData.passA;
  const passwordB = formData.passB;

  //revalidate input
  const validationErrors = validateForm(username, password, passwordB);
  if (validationErrors.length > 0)
  {
    return NextResponse.json({message: validationErrors}, {status: 400})
  }
  
  try
  {
    const dupes = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username]
      });
    const dupeRow = dupes.rows[0];
    console.log(dupeRow)
    if (dupeRow)
    {
      return NextResponse.json({message: ["Username already taken."]}, {status: 400});
    }
    
    const hashPass = await bcrypt.hash(password, 10);
    const insert = await db.execute({
      sql: "INSERT INTO users (username, password) VALUES (?, ?)",
      args: [username, hashPass]
    });

    
    const res = NextResponse.json({
      success: true,
      message: ["User successfully created."],
    }, {status: 201});

    const newID = Number(insert.lastInsertRowid);
    res.cookies.set('userId', newID.toString(), {
      httpOnly: true,
      secure: false, //change for prod
      sameSite: 'lax',
      maxAge: 60*60*24*7
    });

    return res;
  }
  catch
  {
    console.error('registration error:', error);
    return NextResponse.json({message: ["An unknown error occurred. Please try again."]}, {status: 500});
  }


// usage
// const result = await db.execute({
//   sql: "SELECT * FROM users WHERE id = ?",
//   args: [id]
// });
// const row = result.rows[0];
  






  return NextResponse.json({ success: true, req })
}