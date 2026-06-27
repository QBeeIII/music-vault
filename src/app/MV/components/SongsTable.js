"use client";
import styles from './SongsTable.module.css';
import { useEffect, useState } from 'react';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'link', label: 'Link' },
];

function getSongId(song) {
  return song?.id ?? song?.songID ?? song?.songId ?? song?.uuid ?? null;
}

export function SongsTable({ songListProp }) {
  const [songs, setSongs] = useState(songListProp ?? []);
  const [loading, setLoading] = useState(!songListProp?.length);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', album: '', link: '' });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSongs() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/MV/api/songs');
        if (!res.ok) {
          throw new Error(`Unable to load songs (${res.status})`);
        }

        const data = await res.json();
        if (!cancelled) {
          setSongs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to fetch songs');
          setSongs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const handleRefresh = () => {
      if (!cancelled) {
        void fetchSongs();
      }
    };

    if (!songListProp?.length) {
      void fetchSongs();
    }

    window.addEventListener('songs:refresh', handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('songs:refresh', handleRefresh);
    };
  }, [songListProp]);

  function startEdit(song) {
    setEditingId(getSongId(song));
    setActionError(null);
    setEditForm({
      title: song?.title ?? '',
      artist: song?.artist ?? '',
      album: song?.album ?? '',
      link: song?.link ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ title: '', artist: '', album: '', link: '' });
    setActionError(null);
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function handleEditSubmit(event, song) {
    event.preventDefault();
    const songID = getSongId(song);

    if (!songID) {
      setActionError('Unable to identify the selected song.');
      return;
    }

    try {
      const res = await fetch('/MV/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'modify',
          songID,
          title: editForm.title,
          artist: editForm.artist,
          album: editForm.album,
          link: editForm.link,
        }),
      });

      if (!res.ok) {
        throw new Error(`Unable to update song (${res.status})`);
      }

      cancelEdit();
      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (err) {
      setActionError(err?.message ?? 'Failed to update song');
    }
  }

  async function handleDelete(song) {
    const songID = getSongId(song);

    if (!songID) {
      setActionError('Unable to identify the selected song.');
      return;
    }

    if (!window.confirm('Delete this song entry?')) {
      return;
    }

    try {
      const res = await fetch('/MV/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'delete', songID }),
      });

      if (!res.ok) {
        throw new Error(`Unable to delete song (${res.status})`);
      }

      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (err) {
      setActionError(err?.message ?? 'Failed to delete song');
    }
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={[styles.tableRow, styles.headerRow].join(' ')}>
        {columns.map((column) => (
          <div key={column.key} className={[styles.tableCell, styles.tableHeader].join(' ')}>
            {column.label}
          </div>
        ))}
        <div className={[styles.tableCell, styles.tableHeader].join(' ')}>Actions</div>
      </div>

      {loading && <div className={styles.tableMessage}>Loading songs…</div>}
      {error && <div className={styles.tableMessageError}>{error}</div>}
      {!loading && !error && songs.length === 0 && (
        <div className={styles.tableMessage}>No songs available yet.</div>
      )}
      {actionError && <div className={styles.tableMessageError}>{actionError}</div>}

      {!loading && !error && songs.map((song, index) => {
        const songId = getSongId(song) ?? index;
        const isEditing = editingId === songId;

        return (
          <div key={songId}>
            <div className={styles.tableRow}>
              {columns.map((column) => (
                <div key={column.key} className={[styles.tableCell, styles.tableData].join(' ')}>
                  {column.key === 'link' ? (
                    <a
                      className={styles.linkText}
                      href={song[column.key] || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {song[column.key] || 'No link'}
                    </a>
                  ) : (
                    <span>{song[column.key] ?? '-'}</span>
                  )}
                </div>
              ))}

              <div className={[styles.tableCell, styles.tableData, styles.actionCell].join(' ')}>
                {!isEditing ? (
                  <div className={styles.actionButtons}>
                    <button type="button" className={styles.secondaryButton} onClick={() => startEdit(song)}>
                      Edit
                    </button>
                    <button type="button" className={styles.dangerButton} onClick={() => void handleDelete(song)}>
                      Delete
                    </button>
                  </div>
                ) : (
                  <span className={styles.editingLabel}>Editing…</span>
                )}
              </div>
            </div>

            {isEditing && (
              <form className={styles.editForm} onSubmit={(event) => void handleEditSubmit(event, song)}>
                <div className={styles.editFields}>
                  <label className={styles.editField}>
                    <span>Title</span>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) => updateEditForm('title', event.target.value)}
                      required
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Artist</span>
                    <input
                      type="text"
                      value={editForm.artist}
                      onChange={(event) => updateEditForm('artist', event.target.value)}
                      required
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Album</span>
                    <input
                      type="text"
                      value={editForm.album}
                      onChange={(event) => updateEditForm('album', event.target.value)}
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Link</span>
                    <input
                      type="text"
                      value={editForm.link}
                      onChange={(event) => updateEditForm('link', event.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.editActions}>
                  <button type="submit" className={styles.primaryButton}>Save</button>
                  <button type="button" className={styles.secondaryButton} onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
