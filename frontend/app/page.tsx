"use client";

import { useState } from "react";

const API_BASE =
  "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type Wallet = {
  walletId: string;
  balance: number;
  currency: string;
  createdAt: string;
};

export default function Home() {
  const [walletId, setWalletId] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createWallet() {
    setLoading(true);
    setError("");
    setWallet(null);

    if (!API_KEY) {
      throw new Error("NEXT_PUBLIC_API_KEY is not set");
    }
    
    try {


      const res = await fetch(`${API_BASE}/wallet`, { method: "POST" ,headers: {"x-api-key": API_KEY!}});
      const data = await res.json();

      setWallet(data);
      setWalletId(data.walletId);
    } catch {
      setError("Failed to create wallet");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWallet() {
    if (!walletId) return;

    setLoading(true);
    setError("");
    setWallet(null);

    try {
      const res = await fetch(`${API_BASE}/wallet/${walletId}`, {
          headers: {
            "x-api-key": API_KEY!,
          },
        });

      const data = await res.json();

      if (res.ok) {
        setWallet(data);
      } else {
        setError(data.message || "Wallet not found");
      }
    } catch {
      setError("Failed to fetch wallet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          BalanceGate Wallet
        </h1>

        <button
          onClick={createWallet}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
        >
          Create Wallet
        </button>

        <div className="flex gap-2 mb-4">
          <input
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            placeholder="Wallet ID"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={fetchWallet}
            disabled={loading}
            className="bg-green-600 text-white px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Fetch
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-600">Loading...</p>
        )}

        {error && (
          <p className="text-center text-red-600 mb-4">{error}</p>
        )}

        {wallet && (
          <div className="mt-6 border rounded-lg p-4 bg-slate-50">
            <h2 className="font-semibold mb-3 text-lg">Wallet Details</h2>

            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Wallet ID:</span>
                <br />
                <span className="break-all">{wallet.walletId}</span>
              </p>

              <p>
                <span className="font-medium">Balance:</span>{" "}
                {wallet.balance} {wallet.currency}
              </p>

              <p>
                <span className="font-medium">Created At:</span>
                <br />
                {new Date(wallet.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
