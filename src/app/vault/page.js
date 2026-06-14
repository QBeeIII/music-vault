import { SongsTable } from "../../components/musicVault/SongsTable";





export default function VaultPage() {
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
    {displayTitle && <h1>{title}</h1>}
    
    <p>Here is a list of songs I like:</p>
    <SongsTable songListProp={songList} />
    <p>
      {displayEndMessage && <a href="https://www.billboard-japan.com/charts/detail?a=niconico">See More</a>}
    </p>
    </>
  )
}