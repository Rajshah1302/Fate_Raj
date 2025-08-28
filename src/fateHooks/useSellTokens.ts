"use client";
import { useCallback } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useWallet } from "@suiet/wallet-kit";
import toast from "react-hot-toast";

interface SellTokensParams {
  amount: number;
  isBull: boolean;
  vaultId: string;
}

export function useSellTokens() {
  const { account, signAndExecuteTransaction } = useWallet();

  const sellTokens = useCallback(
    async ({ amount, isBull, vaultId }: SellTokensParams) => {
      if (!amount || amount <= 0 || !account?.address) {
        toast.error("Please enter a valid amount and connect your wallet");
        return;
      }

      const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
      const NEXT_SUPRA_ORACLE_HOLDER = process.env.NEXT_SUPRA_ORACLE_HOLDER || '0x87ef65b543ecb192e89d1e6afeaf38feeb13c3a20c20ce413b29a9cbfbebd570';
      const NEXT_GLOBAL_REGISTRY = process.env.NEXT_GLOBAL_REGISTRY || '0x48fbdd71557a10315f14658ee6f855803d62402db5e77a90801df90407b43e2a';
      if (!PACKAGE_ID || !NEXT_SUPRA_ORACLE_HOLDER) {
        toast.error("Missing PACKAGE_ID or NEXT_SUPRA_ORACLE_HOLDER in env");
        return;
      }

      try {
        console.log(`Starting ${isBull ? "bull" : "bear"} token sale...`, {
          amount,
          vaultId,
        });

        const tokenAmount = BigInt(Math.floor(amount * 1_000_000_000));

        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::prediction_pool::redeem_token`,
          arguments: [
            tx.object(vaultId),  
            tx.object(NEXT_GLOBAL_REGISTRY!),             
            tx.pure.bool(isBull),             
            tx.pure.u64(tokenAmount),         
            tx.object(NEXT_SUPRA_ORACLE_HOLDER),   
          ],
        });

        tx.setGasBudget(100_000_00);

        console.log("Executing sell transaction...");
        const result = await signAndExecuteTransaction({ transaction: tx });

        console.log("Transaction result:", result);
        toast.success(`${isBull ? "Bull" : "Bear"} token sale successful!`);
        window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Sell token failed:", error);
        toast.error(
          `${isBull ? "Bull" : "Bear"} token sale failed: ${error.message}`
        );
      }
    },
    [account?.address, signAndExecuteTransaction]
  );

  return { sellTokens };
}
