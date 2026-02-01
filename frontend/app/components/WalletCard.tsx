"use client";

import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE =
  "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

type Wallet = {
  walletId: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
};

export default function WalletDetailPage() {
  const { walletId } = useParams<{ walletId: string }>();
  const auth = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch wallet details
  useEffect(() => {
    if (!auth.user?.access_token) return;

    setLoading(true);

    fetch(`${API_BASE}/wallet/${walletId}`, {
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    })
      .then((res) => res.json())
      .then(setWallet)
      .catch(() => setError("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, [walletId, auth.user]);

  // 🔹 Credit / Debit
  async function submit(amountValue: number) {
    if (!amountValue) return;

    setLoading(true);
    setError("");

    try {
      await fetch(`${API_BASE}/wallet/${walletId}/transaction`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${auth.user?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountValue }),
      });

      // refresh wallet after transaction
      const res = await fetch(`${API_BASE}/wallet/${walletId}`, {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${auth.user?.access_token}`,
        },
      });

      const updated = await res.json();
      setWallet(updated);
      setAmount("");
    } catch {
      setError("Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !wallet) {
    return <p className="p-8">Loading wallet...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!wallet) return null;

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      {/* 🔹 Wallet Card */}
      <div className="border rounded-xl p-6 bg-white shadow">
        <h1 className="text-xl font-bold mb-2">
          💼 {wallet.name || "Wallet"}
        </h1>

        <p className="text-sm text-gray-600 break-all">
          <strong>ID:</strong> {wallet.walletId}
        </p>

        <p className="mt-3 text-lg font-semibold">
          Balance: {wallet.balance} {wallet.currency}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Created: {new Date(wallet.createdAt).toLocaleString()}
        </p>
      </div>

      {/* 🔹 Transaction Controls */}
      <div className="border rounded-xl p-6 bg-slate-50">
        <h2 className="font-semibold mb-3">Update Balance</h2>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="border p-2 w-full mb-4 rounded"
        />

        <div className="flex gap-3">
          <button
            onClick={() => submit(Number(amount))}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Credit
          </button>

          <button
            onClick={() => submit(-Number(amount))}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Debit
          </button>
        </div>
      </div>
    </div>
  );
}
