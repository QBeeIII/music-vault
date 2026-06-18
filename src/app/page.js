import Link from "next/link"

export default function HomePage() {
  return (
    <>
    <h1>Kazya Takahashi</h1>
    <p>Welcome to my website!</p>

    <Link href="/MV"><h3>Music Vault</h3></Link>
    <div>
      <a href="https://www.linkedin.com/in/kazya-takahashi/">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
      </svg>
      </a>
      <a href="https://www.linkedin.com/in/kazya-takahashi/">LinkedIn</a>
    </div>
    

    </>
  )
}