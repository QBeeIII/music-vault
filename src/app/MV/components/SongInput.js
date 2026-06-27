"use client";
import styles from "./SongInput.module.css";
import { YoutubeAPI } from "./YoutubeAPI";
import { useState } from 'react';

export function SongInput() {
  const [showInput, setShowInput] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [artistInput, setArtistInput] = useState("");
  const [albumInput, setAlbumInput] = useState("");
  const [linkInput, setLinkInput] = useState("");

  function toggleInput() {
    setShowInput(!showInput);
  }

  async function SongSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get('songTitle');
    const artist = formData.get('songArtist');
    const album = formData.get('songAlbum');
    const link = formData.get('songLink');
    const type = "add";

    try {
      const res = await fetch("/MV/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, artist, album, link }),
      });

      if (!res.ok) {
        throw new Error(`Unable to add song (${res.status})`);
      }

      setTitleInput("");
      setArtistInput("");
      setAlbumInput("");
      setLinkInput("");
      setShowInput(false);
      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (error) {
      console.error('Failed to add song', error);
    }
  }

  return (
    <>
      <button onClick={toggleInput}>Add song</button>

      {showInput && (
        <>
          <form onSubmit={SongSubmit} className={styles.SongInput}>
            <label>Song Title</label> <br />
            <input
              name="songTitle"
              onChange={(e) => setTitleInput(e.target.value)}
              value={titleInput}
              required
            />
            <label>Artist</label> <br />
            <input
              name="songArtist"
              onChange={(e) => setArtistInput(e.target.value)}
              value={artistInput}
              required
            />
            <label>Album</label> <br />
            <input
              name="songAlbum"
              onChange={(e) => setAlbumInput(e.target.value)}
              value={albumInput}
            />
            <label>Link to the Song</label> <br />
            <input
              name="songLink"
              onChange={(e) => setLinkInput(e.target.value)}
              value={linkInput}
            />
            <button type="submit">Add</button>
          </form>

          <YoutubeAPI />
        </>
      )}
    </>
  );
}