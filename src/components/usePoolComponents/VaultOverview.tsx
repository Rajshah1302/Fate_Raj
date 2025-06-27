import { Token, Vault } from "../types";

interface VaultOverviewProps {
  tokens: {
    bullToken: Token;
    bearToken: Token;
  };
  vault: Vault;
  totalValue: number;
}

export const VaultOverview: React.FC<VaultOverviewProps> = ({ tokens, vault, totalValue }) => {
  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
        Vault Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Market Position
          </h3>
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white"
              style={{ width: `${vault.bullPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{vault.bullPercentage.toFixed(2)}% Bull</span>
            <span>{vault.bearPercentage.toFixed(2)}% Bear</span>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Total Value
          </h3>
          <p className="text-2xl font-mono text-black dark:text-white">
            ${totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Previous Price: ${vault.previous_price.toFixed(4)}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Token Prices
          </h3>
          <div className="space-y-2">
            <p className="text-black dark:text-white">
              {tokens.bullToken.symbol}: ${tokens.bullToken.price.toFixed(4)}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                Supply: {tokens.bullToken.supply.toLocaleString()}
              </span>
            </p>
            <p className="text-black dark:text-white">
              {tokens.bearToken.symbol}: ${tokens.bearToken.price.toFixed(4)}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                Supply: {tokens.bearToken.supply.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
