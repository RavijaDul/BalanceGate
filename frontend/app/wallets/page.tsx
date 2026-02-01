"use client";

import { useAuth } from "react-oidc-context";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export default function MyWalletsPage() {
  const auth = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyWalletId = (walletId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(walletId);
    setCopiedId(walletId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetch(`${API_BASE}/wallets`, {
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    })
      .then((res) => res.json())
      .then(setWallets);
  }, [auth.user]);

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-black dark:text-white tracking-tight">My Wallets</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Manage and view all your wallets</p>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No wallets found. Create your first wallet to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((w) => (
              <Link
                key={w.walletId}
                href={`/wallets/${w.walletId}`}
                className="block bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all hover:shadow-xl group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white group-hover:opacity-70 transition-opacity">{w.name}</h3>
                  <span className="text-2xl">💳</span>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-black dark:text-white">
                    {w.balance} <span className="text-lg text-slate-600 dark:text-slate-400">{w.currency}</span>
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-black px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-mono truncate flex-1">{w.walletId}</p>
                    <button
                      onClick={(e) => copyWalletId(w.walletId, e)}
                      className="flex-shrink-0 text-slate-400 hover:text-black dark:hover:text-white transition-colors p-1"
                      title="Copy Wallet ID"
                    >
                      {copiedId === w.walletId ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-semibold">✓ Copied!</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
