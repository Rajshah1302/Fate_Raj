"use client";

import { DualTokenVaultProps } from "./types";
import { useTokenBalances } from "../../../hooks/useTokenBalances";
import { useWalletTransactions } from "../../../hooks/useWalletTransactions";
import { VaultHeader } from "@/components/usePoolComponents/VaultHeader";
import { VaultOverview } from "@/components/usePoolComponents/VaultOverview";
import { VaultActions } from "@/components/usePoolComponents/VaultActions";
import { VaultDetails } from "@/components/usePoolComponents/VaultDetails";

export default function DualTokenVault({ tokens, vault }: DualTokenVaultProps) {
  const { bullAmount, bearAmount, setBullAmount, setBearAmount } =
    useTokenBalances(tokens.bullToken.id, tokens.bearToken.id);
  const DENOMINATOR = 100; 
  const { handleBuy, handleSell } = useWalletTransactions();
  const bullPrice = tokens.bullToken.price;
  const bearPrice = tokens.bearToken.price;
  const swapFee =
    (tokens.bullToken.treasury_fee +
      tokens.bearToken.vault_creator_fee +
      tokens.bearToken.vault_fee) /
    DENOMINATOR;
  const bullValue = tokens.bullToken.price * tokens.bullToken.balance;
  const bearValue = tokens.bearToken.price * tokens.bearToken.balance;
  const totalValue = bullValue + bearValue;

  const handleDistribute = () => {
    console.log("Distribute Outcome function call");
  };

  return (
    <div className="w-full pt-14 bg-white dark:bg-black">
      <div className="w-full md:px-24 lg:px-24">
        <VaultHeader
          tokens={tokens}
          bullAmount={bullAmount}
          bearAmount={bearAmount}
        />

        <div className="container mx-auto px-8 py-6 space-y-8">
          <VaultOverview
            tokens={tokens}
            vault={vault}
            totalValue={totalValue}
          />

          <VaultActions
            tokens={tokens}
            bullAmount={bullAmount}
            bearAmount={bearAmount}
            setBullAmount={setBullAmount}
            setBearAmount={setBearAmount}
            onBuy={handleBuy}
            onSell={handleSell}
            onDistribute={handleDistribute}
            bullPrice={bullPrice}
            bearPrice={bearPrice}
            swapFee={swapFee}
          />

          <VaultDetails tokens={tokens} vault={vault} />
        </div>
      </div>
    </div>
  );
}
