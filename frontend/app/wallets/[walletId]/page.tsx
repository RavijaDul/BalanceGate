"use client";

import { useAuth } from "react-oidc-context";
import { useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export default function WalletDetailPage() {
  const { walletId } = useParams();
  const auth = useAuth();
  const [amount, setAmount] = useState("");

  async function submit(amountValue: number) {
    await fetch(`${API_BASE}/wallet/${walletId}/transaction`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${auth.user?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountValue }),
    });
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Wallet Actions</h1>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="border p-2 w-full mb-4"
      />

      <div className="flex gap-2">
        <button
          onClick={() => submit(Number(amount))}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Credit
        </button>

        <button
          onClick={() => submit(-Number(amount))}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Debit
        </button>
      </div>
    </div>
  );
}
