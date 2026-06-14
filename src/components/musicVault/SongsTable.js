import styles from './SongsTable.module.css';

export function SongsTable({songListProp})
{
  if (songListProp.length === 0)
  {
    return <p>No songs available.</p>;
  }

  return (
    <ul className={styles.songList}>
      {songListProp.map((songItem, index) => (
        <li key={index}>
          {songItem.artist + " - " + songItem.title}
        </li>
      ))}
    </ul>
  )
}