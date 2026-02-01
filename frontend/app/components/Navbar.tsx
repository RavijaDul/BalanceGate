"use client";

import Link from "next/link";
import { useAuth } from "react-oidc-context";

export default function Navbar() {
  const auth = useAuth();

  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800">
      <Link href="/" className="font-bold text-xl tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity">
        BalanceGate
      </Link>

      <div className="flex items-center gap-6">
        <Link 
          href="/create" 
          className="text-black dark:text-white font-semibold hover:opacity-70 transition-opacity"
        >
          Create Wallet
        </Link>

        <Link 
          href="/wallets" 
          className="text-black dark:text-white font-semibold hover:opacity-70 transition-opacity"
        >
          My Wallets
        </Link>

        <Link 
          href="/fetch" 
          className="text-black dark:text-white font-semibold hover:opacity-70 transition-opacity"
        >
          Fetch Wallet
        </Link>

        {!auth.isAuthenticated ? (
          <button
            onClick={() => auth.signinRedirect()}
            className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Sign in
          </button>
        ) : (
          <button
            onClick={() => auth.removeUser()}
            className="bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
