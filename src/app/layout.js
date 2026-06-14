import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/musicVault/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: '%s · Music Vault',
    default: 'Music Vault',
  },
  description: 'A place to sort and store your music',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Navbar />
        
        
        <main style={{marginTop: "60px"}}>
          {children}
        </main>


      </body>
    </html>
  );
}
