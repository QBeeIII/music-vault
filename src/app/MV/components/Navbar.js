import navbarStyles from './Navbar.module.css';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogoutButton } from './Logout';
import { verifyJwt } from '../lib/jwt';



export async function Navbar() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  const isLoggedIn = !!payload?.sub;

  return (
    <header className={navbarStyles.Navbar}>
      <Link style={{float:"left"}} href="/MV">Logo/Brand</Link>

      {/* <Link href="/MV/logout">Dark/Light</Link> */}
      {isLoggedIn ? (
        <LogoutButton className={navbarStyles.logout} />
      ) : (
        <div>
          <Link href="/MV/login">Login</Link>
          <Link href="/MV/register">Register</Link>
        </div>
      )}

      <Link href="/MV/about">About</Link>
      <Link href="/MV/stats">Stats</Link>
      <Link href="/MV/vault">My Vault</Link>
    </header>
  )
}