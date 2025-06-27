import { Coins } from "lucide-react";
import { Token } from "../../app/usePool/[id]/types";

interface VaultHeaderProps {
  tokens: {
    bullToken: Token;
    bearToken: Token;
  };
  bullAmount?: number;
  bearAmount?: number;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({ tokens, bullAmount, bearAmount }) => {
  return (
    <div className="container mx-auto px-8 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <Coins className="h-8 w-8 text-black dark:text-white" />
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {tokens.bullToken.name} / {tokens.bearToken.name} Vault
        </h1>
      </div>

      <div className="flex space-x-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-5 py-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">
            {tokens.bullToken.name} Balance
          </div>
          <div className="font-mono text-lg text-black dark:text-white">
            {bullAmount?.toFixed(2)} {tokens.bullToken.symbol}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ${bearAmount?.toFixed(2)} {tokens.bearToken.symbol}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-5 py-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">
            {tokens.bearToken.name} Balance
          </div>
          <div className="font-mono text-lg text-black dark:text-white">
            {tokens.bearToken.balance.toFixed(2)} {tokens.bearToken.symbol}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ${(tokens.bearToken.price * tokens.bearToken.balance).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};