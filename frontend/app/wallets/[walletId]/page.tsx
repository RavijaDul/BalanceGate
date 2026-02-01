"use client";

import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API_BASE = "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

type MessageType = "success" | "error" | "warning";

interface Message {
  text: string;
  type: MessageType;
}

export default function WalletDetailPage() {
  const { walletId } = useParams();
  const auth = useAuth();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (text: string, type: MessageType) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  async function fetchBalance() {
    if (!auth.user?.access_token) return;
    try {
      const response = await fetch(`${API_BASE}/wallet/${walletId}`, {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${auth.user?.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("Wallet data:", data);
        setBalance(data.balance);
      } else {
        // console.error("Failed to fetch wallet:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }

  useEffect(() => {
    fetchBalance();
  }, [auth.user?.access_token, walletId]);

  async function submit(amountValue: number) {
    setLoading(true);
    // console.log("Submitting transaction:", { amount: amountValue, type: amountValue > 0 ? "Credit" : "Debit" });
    try {
      const response = await fetch(`${API_BASE}/wallet/${walletId}/transaction`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${auth.user?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        // console.error("Transaction failed:", error);
        showMessage(`Error: ${error.message}`, "error");
        return;
      }

      const result = await response.json();
      setBalance(result.balance);
      showMessage(`Success! New balance: $${result.balance.toFixed(2)}`, "success");
      setAmount("");
    } catch (error) {
      showMessage(`Request failed: ${error}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-md mx-auto relative min-h-screen sm:min-h-0">      {message && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 rounded-lg shadow-2xl w-11/12 sm:max-w-md z-50 animate-slide-in ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : message.type === "error"
              ? "bg-red-600 text-white"
              : "bg-yellow-500 text-black"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">
              {message.type === "success" ? "✓" : message.type === "error" ? "✕" : "⚠"}
            </span>
            <span className="text-base sm:text-lg break-words">{message.text}</span>
          </div>
        </div>
      )}
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Wallet Actions</h1>
      
      {balance !== null && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-blue-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Current Balance</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-black">${balance.toFixed(2)}</div>
        </div>
      )}

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        type="number"
        className="border border-gray-300 p-3 sm:p-4 w-full mb-4 sm:mb-6 rounded-lg text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => {
            const num = Number(amount);
            if (isNaN(num) || num <= 0) {
              showMessage("Please enter a valid positive amount", "warning");
              return;
            }
            submit(num);
          }}
          disabled={loading}
          className="bg-green-800 hover:bg-green-700 text-white px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 shadow-md"
        >
          {loading ? "Processing..." : "Credit"}
        </button>

        <button
          onClick={() => {
            const num = Number(amount);
            if (isNaN(num) || num <= 0) {
              showMessage("Please enter a valid positive amount", "warning");
              return;
            }
            if (balance !== null && num > balance) {
              showMessage(`Cannot debit $${num}. Current balance is only $${balance.toFixed(2)}`, "error");
              return;
            }
            submit(-num);
          }}
          disabled={loading}
          className="bg-red-950 hover:bg-red-700 text-white px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 shadow-md"
        >
          {loading ? "Processing..." : "Debit"}
        </button>
      </div>
    </div>
  );
}
