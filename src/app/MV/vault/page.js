import { SongsTable } from "../components/SongsTable";
import { YoutubeAPI } from "../components/YoutubeAPI";
import { cookies } from 'next/headers';



const {google} = require("googleapis");
const youtube = google.youtube("v3");





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





export default async function VaultPage()
{
  const cookieStore = await cookies();
  const isLoggedIn = !!(cookieStore.get('userId')?.value)

  const displayTitle = true;
  const uppercaseTitle = false;
  const displayEndMessage = true;

  const title = uppercaseTitle ? "Kazya Takahashi's Music Vault".toUpperCase() : "Kazya Takahashi's Music Vault";

  const songList = [
    {artist:"鬱P", title:"かくさしゃかい"},
    {artist:"鬱P", title:"シマシマメロディ"},
    {artist:"結束バンド", title:"フラシュバッカー"}
  ];

  


  return (
    <>
    {isLoggedIn ? (
      <>
      <YoutubeAPI />
      {displayTitle && <h1>{title}</h1>}
      
      <p>Here is a list of songs I like:</p>
      <SongsTable songListProp={songList} />
      <p>
        {displayEndMessage && <a href="https://www.billboard-japan.com/charts/detail?a=niconico">See More</a>}
      </p>
      </>
    ) : (
      <h1>Please log in to view your vault.</h1>
    )}
    </>
  )
}