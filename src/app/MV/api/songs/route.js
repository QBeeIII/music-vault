import { NextResponse } from 'next/server';
import { verifyJwt } from '../../lib/jwt';
import { enforceRateLimit, clearRateLimit, validateRegisterPayload, getClientIp } from '../../lib/auth';
import db from '../../db/database';

export async function GET(req)
{
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

export async function POST(req)
{
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rateLimitKey = `songs:${ip}`;
  const rateLimitError = enforceRateLimit(rateLimitKey, 1, 2);

  if (rateLimitError) {
    return NextResponse.json({ message: [rateLimitError] }, { status: 429 });
  }
  

  const { type, songID, title, artist, album, link } = await req.json();

  try
  {
    if (type == "add")
    {

      try
      {
        const insert = await db.execute({
          sql: 'INSERT INTO songs (user_id, title, artist, album, link) VALUES (?, ?, ?, ?, ?)',
          args: [payload.sub, title, artist, album, link]
        });
      }
      catch (error)
      {
        console.error('song add error:', error);
        return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
      }

        return NextResponse.json({
          success: true,
          message: ['Song successfully created.']
        }, { status: 201 });


    }
    else if (type == "modify")
    {

      try
      {
        const modify = await db.execute({
          sql: 'UPDATE songs SET title = ?, artist = ?, album = ?, link = ? WHERE id = ?',
          args: [title, artist, album, link, songID]
        });
      }
      catch (error)
      {
        console.error('song modify error:', error);
        return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: ['Song successfully modified.']
      }, { status: 201 });
    }
    else if (type == "delete")
    {

      try
      {
        const destroy = await db.execute({
          sql: 'DELETE FROM songs WHERE id = ?',
          args: [songID]
        });
      }
      catch (error)
      {
        console.error('song delete error:', error);
        return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: ['Song successfully deleted.']
      }, { status: 201 });
    }
  }
  catch(error)
  {
    console.error('song add error:', error);
    return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });

  }


}