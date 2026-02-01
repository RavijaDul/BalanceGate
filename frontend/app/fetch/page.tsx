"use client";

import { useState } from "react";
import { useAuth } from "react-oidc-context";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export default function FetchWalletPage() {
  const auth = useAuth();
  const [walletId, setWalletId] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState("");

  async function fetchWallet() {
    if (!auth.user?.access_token) {
      setError("Please sign in first");
      return;
    }

    const res = await fetch(`${API_BASE}/wallet/${walletId}`, {
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setWallet(data);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-black dark:text-white tracking-tight">Fetch Wallet</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Retrieve wallet details by ID</p>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="space-y-4">
            <input
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              placeholder="Enter Wallet ID"
              className="border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-mono"
            />

            <button
              onClick={fetchWallet}
              className="w-full bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Fetch Wallet
            </button>
          </div>

          {wallet && (
            <div className="mt-8 bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <h3 className="font-bold text-lg mb-4 text-black dark:text-white">Wallet Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Wallet ID</p>
                  <p className="font-mono text-sm text-black dark:text-white break-all bg-slate-100 dark:bg-zinc-900 p-3 rounded-lg">{wallet.walletId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{wallet.balance} {wallet.currency}</p>
                </div>
                {wallet.createdAt && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Created</p>
                    <p className="text-black dark:text-white">{new Date(wallet.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
              <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
