"use client";

import { useState } from "react";
import { useAuth } from "react-oidc-context";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export default function CreateWalletPage() {
  const auth = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [walletName, setWalletName] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState("");

  async function createWallet() {
    setError("");
    setWallet(null);

    if (!auth.user?.access_token) {
      setError("Please sign in first");
      return;
    }

    const res = await fetch(`${API_BASE}/wallet`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${auth.user.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency,
        name: walletName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to create wallet");
      return;
    }

    setWallet(data);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-black dark:text-white tracking-tight">Create Wallet</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Set up a new wallet to manage your funds</p>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="space-y-6">
            <div>
              <label className="block mb-3 font-semibold text-black dark:text-white">Wallet Name</label>
              <input
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="My Personal Wallet"
              />
            </div>

            <div>
              <label className="block mb-3 font-semibold text-black dark:text-white">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>LKR</option>
              </select>
            </div>

            <button
              onClick={createWallet}
              className="w-full bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Create Wallet
            </button>
          </div>

          {wallet && (
            <div className="mt-8 bg-white dark:bg-zinc-800 border-2 border-green-500 dark:border-green-400 p-6 rounded-2xl">
              <p className="font-bold mb-4 text-green-700 dark:text-green-400 text-lg">✅ Wallet Created Successfully</p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Wallet ID:</p>
                  <code className="block bg-slate-100 dark:bg-zinc-900 text-black dark:text-white p-4 rounded-lg break-all font-mono text-sm border border-slate-200 dark:border-zinc-700">
                    {wallet.walletId}
                  </code>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 pt-2">
                  💡 Save this Wallet ID to access your wallet later.
                </p>
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
