import styles from "./Navbar.module.css"
import Link from "next/link"


export function Navbar(){
  return (
    <header className={styles.Navbar}>
      <Link style={{float:"left"}} href="/">Logo/Brand</Link>
      <Link href="/logout">Dark/Light</Link>
      <Link href="/logout">Logout</Link>
      <Link href="/about">About</Link>
      <Link href="/stats">Stats</Link>
      <Link href="/vault">My Vault</Link>
    </header>
  )
}