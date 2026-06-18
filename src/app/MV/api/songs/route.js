import { NextResponse } from 'next/server';
import db from '../../db/database';
import { verifyJwt } from '../../lib/jwt';

export async function GET(req) {
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const songs = await db.execute({
    sql: 'SELECT * FROM songs WHERE user_id = ?',
    args: [payload.sub]
  });
  
  return NextResponse.json(songs.rows);
}