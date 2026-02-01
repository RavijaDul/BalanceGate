"use client";

import Link from "next/link";
import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p className="p-8">Loading authentication...</p>;
  }

  if (auth.error) {
    return <p className="p-8 text-red-600">Error: {auth.error.message}</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-black dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl border border-slate-200 dark:border-zinc-800 max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            WALLET MANAGEMENT
            <span className="block text-lg font-normal text-slate-600 dark:text-slate-400 mt-2">WITHOUT THE HASSLE</span>
          </h1>

          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            A secure serverless wallet application built with AWS and Next.js.
            Manage your digital wallets with ease.
          </p>
        </div>

        {!auth.isAuthenticated ? (
          <div className="text-center">
            <button
              onClick={() => auth.signinRedirect()}
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Sign in to continue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Signed in as</p>
              <p className="font-semibold text-slate-900 dark:text-white">{auth.user?.profile?.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/create" 
                className="bg-zinc-900 text-white px-6 py-4 rounded-xl font-bold text-lg text-center hover:bg-zinc-800 transition-all shadow-lg hover:shadow-2xl border-2 border-zinc-900"
              >
                Create Wallet
              </Link>

              <Link 
                href="/wallets" 
                className="bg-zinc-900 text-white px-6 py-4 rounded-xl font-bold text-lg text-center hover:bg-zinc-800 transition-all shadow-lg hover:shadow-2xl border-2 border-zinc-900"
              >
                My Wallets
              </Link>

              <Link 
                href="/fetch" 
                className="bg-zinc-900 text-white px-6 py-4 rounded-xl font-bold text-lg text-center hover:bg-zinc-800 transition-all shadow-lg hover:shadow-2xl border-2 border-zinc-900"
              >
                Fetch Wallet
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}



// "use client";
// import { useAuth } from "react-oidc-context";
// import { useState } from "react";

// const API_BASE =
//   "https://tvinofjk5j.execute-api.ap-south-1.amazonaws.com/Prod";
// const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// type Wallet = {
//   walletId: string;
//   balance: number;
//   currency: string;
//   createdAt: string;
// };

// export default function Home() {
//   const auth = useAuth();
//   const [walletId, setWalletId] = useState("");
//   const [wallet, setWallet] = useState<Wallet | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const token = auth.user?.access_token;

//   if (auth.isLoading) {
//     return <p>Loading authentication...</p>;
//   }

//   if (auth.error) {
//     return <p>Error: {auth.error.message}</p>;
//   }

//   async function createWallet() {
    
//     setLoading(true);
//     setError("");
//     setWallet(null);

//     if (!API_KEY) {
//       throw new Error("NEXT_PUBLIC_API_KEY is not set");
//     }
//     if (!token) {
//       setError("You must be logged in");
//       return;
//     }

//     try {


//       const res = await fetch(`${API_BASE}/wallet`, { method: "POST" ,headers: {"x-api-key": API_KEY!, Authorization: `Bearer ${token}`,}});
//       const data = await res.json();

//       setWallet(data);
//       setWalletId(data.walletId);
//     } catch {
//       setError("Failed to create wallet");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchWallet() {
//     if (!walletId) return;

//     setLoading(true);
//     setError("");
//     setWallet(null);
//     if (!token) {
//       setError("You must be logged in");
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE}/wallet/${walletId}`, {
//           headers: {
//             "x-api-key": API_KEY!,
//             Authorization: `Bearer ${token}`,
//           },
//         });

//       const data = await res.json();

//       if (res.ok) {
//         setWallet(data);
//       } else {
//         setError(data.message || "Wallet not found");
//       }
//     } catch {
//       setError("Failed to fetch wallet");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">
//           BalanceGate Wallet
//         </h1>
//         {!auth.isAuthenticated ? (
//           <button
//             onClick={() => auth.signinRedirect()}
//             className="w-full bg-black text-white py-2 rounded mb-4"
//           >
//             Sign in
//           </button>
//         ) : (
//           <button
//             onClick={() => auth.removeUser()}
//             className="w-full bg-gray-700 text-white py-2 rounded mb-4"
//           >
//             Sign out
//           </button>
//         )}
//         <button
//           onClick={createWallet}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
//         >
//           Create Wallet
//         </button>

//         <div className="flex gap-2 mb-4">
//           <input
//             value={walletId}
//             onChange={(e) => setWalletId(e.target.value)}
//             placeholder="Wallet ID"
//             className="flex-1 border rounded px-3 py-2"
//           />
//           <button
//             onClick={fetchWallet}
//             disabled={loading}
//             className="bg-green-600 text-white px-4 rounded hover:bg-green-700 disabled:opacity-50"
//           >
//             Fetch
//           </button>
//         </div>

//         {loading && (
//           <p className="text-center text-gray-600">Loading...</p>
//         )}

//         {error && (
//           <p className="text-center text-red-600 mb-4">{error}</p>
//         )}

//         {wallet && (
//           <div className="mt-6 border rounded-lg p-4 bg-slate-50">
//             <h2 className="font-semibold mb-3 text-lg">Wallet Details</h2>

//             <div className="text-sm space-y-2">
//               <p>
//                 <span className="font-medium">Wallet ID:</span>
//                 <br />
//                 <span className="break-all">{wallet.walletId}</span>
//               </p>

//               <p>
//                 <span className="font-medium">Balance:</span>{" "}
//                 {wallet.balance} {wallet.currency}
//               </p>

//               <p>
//                 <span className="font-medium">Created At:</span>
//                 <br />
//                 {new Date(wallet.createdAt).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
