import './vault.css';
import { SongsTable } from '../components/SongsTable';
import { SongInput } from '../components/SongInput';
import { cookies } from 'next/headers';
import { verifyJwt } from '../lib/jwt';


const { google } = require('googleapis');
const youtube = google.youtube('v3');





// get video
// "https://www.googleapis.com/youtube/v3/videos?id=" + videoID + "&key=" + process.env.YTAPIKEY + "&fields=items(id,snippet(channelId,title))&part=snippet"
// {
//   "items": [
//     {
//       "id": "sWOvhZBS9IA",
//       "snippet": {
//         "channelId": "UC2395o6B5FIej43GpqSc1eg",
//         "title": "ビビビビ／星界（Be, be, be, be! / SEKAI）"
//       }
//     }
//   ]
// }

// get channel
// "https://www.googleapis.com/youtube/v3/channels?id=" + channelID + "&key=" + process.env.YTAPIKEY + "&fields=items(id,snippet(title))&part=snippet"
// {
//   "items": [
//     {
//       "id": "UC2395o6B5FIej43GpqSc1eg",
//       "snippet": {
//         "title": "フロクロ"
//       }
//     }
//   ]
// }





export default async function VaultPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  const isLoggedIn = !!payload?.sub;

  const displayTitle = true;
  const uppercaseTitle = false;
  const displayEndMessage = true;

  var title = ""
  if (isLoggedIn)
  {
    title = payload.username + "'s Music Vault";
  }
  

  //testing only
  const songList = [
    {artist:"鬱P", title:"かくさしゃかい"},
    {artist:"鬱P", title:"シマシマメロディ"},
    {artist:"結束バンド", title:"フラシュバッカー"}
  ];

  


  return (
    <>
    {isLoggedIn ? (
      <>
      
      <h1>{title}</h1>
      
      
      <SongInput />


      <SongsTable />

      </>
    ) : (
      <h1>Please log in to view your vault.</h1>
    )}
    </>
  )
}