import { Token } from "@/app/usePool/[id]/types";
import { TokenPoolCard } from "./TokenPoolCard";
import TradingViewWidget from "./graph";

interface VaultActionsProps {
  tokens: {
    bullToken: Token;
    bearToken: Token;
  };
  bullAmount?: number;
  bearAmount?: number;
  setBullAmount: (amount: number) => void;
  setBearAmount: (amount: number) => void;
  onBuy: (tokenId: string, amount: number) => void;
  onSell: (tokenId: string, amount: number) => void;
  onDistribute: () => void;
  bullPrice?: number;
  bearPrice?: number;
  swapFee?: number;
}

export const VaultActions: React.FC<VaultActionsProps> = ({
  tokens,
  bullAmount,
  bearAmount,
  setBullAmount,
  setBearAmount,
  onBuy,
  onSell,
  onDistribute,
  bullPrice,
  bearPrice,
  swapFee,
}) => {
  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-lg space-y-8">
      <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">
        Vault Actions
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
          <TradingViewWidget />
        </div>

        <div>
          <TokenPoolCard
            amount={bullAmount}
            setAmount={setBullAmount}
            onBuy={onBuy}
            onSell={onSell}
            bullToken={tokens.bullToken}
            bearToken={tokens.bearToken}
            bullPrice={bullPrice}
            bearPrice={bearPrice}
            swapFee={swapFee}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onDistribute}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all flex items-center"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Distribute Rewards
        </button>
      </div>
    </section>
  );
};
