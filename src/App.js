import {
  ConnectButton,
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import { toBase64 } from '@mysten/sui/utils';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import './App.css';
import '@mysten/dapp-kit/dist/index.css';
import { useEffect } from 'react';
const backendUrl = process.env.REACT_APP_BACKEND_URL;
// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
});
const queryClient = new QueryClient();

// // App wrapped with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig}>
        <WalletProvider>
          <TransactionComponent />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;

// function TransactionComponent() {
//   const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
//   const [digest, setDigest] = useState('');
//   const [recipient, setRecipient] = useState(''); // State for recipient address
//   const currentAccount = useCurrentAccount();

//   return (
//     <div style={{ padding: 20 }}>
//       <ConnectButton />
//       {currentAccount ? (
//         <>
//           <div>
//             <input
//               type="text"
//               placeholder="0x4f26288a8243a3914232ab3f776b4061fe209b62b4dc9537a46f95668a21da2e"
//               value={recipient}
//               onChange={(e) => setRecipient(e.target.value)}
//               style={{ marginRight: 10 }}
//             />
//             <button
//               onClick={() => {
               
//                 const transaction = new Transaction();
//                 const amountToTransfer = 1;
//                 const recipientAddress = "0x4f26288a8243a3914232ab3f776b4061fe209b62b4dc9537a46f95668a21da2e";
//                 const coin = transaction.splitCoins(transaction.gas, [amountToTransfer * 10 ** 9]);
//                 transaction.transferObjects([coin], recipientAddress);
//                 // const [coin] = transaction.splitCoins(transaction.gas, [1000]);
//                 // amount: 2_000_000_000, // 2 SUI in MIST (1 SUI = 1_000_000_000 MIST)
//                 // transaction.transferObjects(
//                 //   ["0xdddf0e175ba253f5a41e54eb801ca60af017f97cd3e3f7492984c82dbefe18b8"],
//                 //   recipient, // 2 SUI in MIST (1 SUI = 1_000_000_000 MIST)
//                 // );

//                 signAndExecuteTransaction(
//                   {
//                     transaction,
//                     chain: 'sui:testnet', // Ensure this matches your network configuration
//                   },
//                   {
//                     onSuccess: (result) => {
//                       console.log('Transaction successful:', result);
//                       setDigest(result.digest);
//                     },
//                     onError: (error) => {
//                       console.error('Transaction failed:', error);
//                     },
//                   }
//                 );
//               }}
//             >
//               Transfer 2 SUI
//             </button>
//           </div>
//           <div>Digest: {digest}</div>
//         </>
//       ) : (
//         <div>Please connect your wallet to proceed.</div>
//       )}
//     </div>
//   );
// }


// // const amountToTransfer = 1;
// // const recipientAddress = "";

// // const transaction = new Transaction();
// // const coin = transaction.splitCoins(transaction.gas, [amountToTransfer * 10 ** 9]);
// // transaction.transferObjects([coin], recipientAddress);



// // 0x39e2a88e7fe2a4d0e17425e9d41e498602a8a4a0f3b5fea6073ebfc04934403c






// import { useLocation } from 'react-router-dom'; // Only if using react-router-dom
// If not using react-router, use window.location directly.

function TransactionComponent() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState('');
  const [recipient, setRecipient] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [suiAmount, setSuiAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wallet = params.get('wallet');
    const amount = params.get('amount');
    const order = params.get('order_id');

    if (wallet) setWalletAddress(wallet);
    if (amount) setSuiAmount(amount);
    if (order) setOrderId(order);

    if (wallet) setRecipient(wallet);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <ConnectButton />
      {currentAccount ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <strong>Wallet Address:</strong> {walletAddress || 'N/A'} <br />
            <strong>SUI Amount:</strong> {suiAmount || 'N/A'} <br />
            <strong>Order ID:</strong> {orderId || 'N/A'}
          </div>

          <div>
            <input
              type="text"
              placeholder="Recipient wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <button
              onClick={() => {
                const transaction = new Transaction();
                const amountToTransfer = parseFloat(suiAmount || '0') * 10 ** 9;
                const coin = transaction.splitCoins(transaction.gas, [amountToTransfer]);
                transaction.transferObjects([coin], recipient);

                signAndExecuteTransaction(
                  {
                    transaction,
                    chain: 'sui:testnet',
                  },
                  {
                    onSuccess: (result) => {
                      console.log('Transaction successful:', result);
                      setDigest(result.digest);
                    
                      // Send digest and orderId to backend
                      fetch(backendUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          orderId: orderId,
                          digest: result.digest,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          console.log('Backend response:', data);
                        })
                        .catch((err) => {
                          console.error('Failed to notify backend:', err);
                        });
                    },
                    
                  }
                );
              }}
            >
              Transfer {suiAmount || 'X'} SUI
            </button>
          </div>
          <div>Digest: {digest}</div>
        </>
      ) : (
        <div>Please connect your wallet to proceed.</div>
      )}
    </div>
  );
}
