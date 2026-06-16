import { NextResponse } from 'next/server'
//import db from '../../db/database'

//local db so i dont spend credits
import { createClient } from '@libsql/client';
import path from 'path';
const dbPath = path.join(process.cwd(), 'src', 'app', 'MV', 'music-vault.db');
const db = createClient({
  url: `file:${dbPath}`
});

export async function GET(req)
{
  const userId = req.cookies.get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const songs = await db.execute({
    sql: "SELECT * FROM songs WHERE user_id = ?",
    args: [userId]
  });
  
  return NextResponse.json(songs.rows);
}