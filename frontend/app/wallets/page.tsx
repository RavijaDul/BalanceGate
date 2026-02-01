"use client";

import { useAuth } from "react-oidc-context";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export default function MyWalletsPage() {
  const auth = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);

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
                href={`/wallet/${w.walletId}`}
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
                  <p className="text-sm text-slate-500 dark:text-slate-500 font-mono break-all">{w.walletId}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
