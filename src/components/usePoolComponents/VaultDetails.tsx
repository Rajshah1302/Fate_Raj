import { Token, Vault } from "../../app/usePool/[id]/types";

interface VaultDetailsProps {
  tokens: {
    bullToken: Token;
    bearToken: Token;
  };
  vault: Vault;
}

export const VaultDetails: React.FC<VaultDetailsProps> = ({ tokens, vault }) => {
  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
        Vault Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Fees
          </h3>
          <div className="space-y-2 text-black dark:text-white">
            <p>Entry: {vault.fees.entry}%</p>
            <p>Exit: {vault.fees.exit}%</p>
            <p>Performance: {vault.fees.performance}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Treasury Fee: {tokens.bullToken.treasury_fee / 100}%
            </p>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Token Info
          </h3>
          <div className="space-y-2 text-black dark:text-white">
            <p>
              <span className="font-medium">Bull Token ID:</span>
              <span className="text-sm font-mono block truncate">
                {tokens.bullToken.id}
              </span>
            </p>
            <p>
              <span className="font-medium">Bear Token ID:</span>
              <span className="text-sm font-mono block truncate">
                {tokens.bearToken.id}
              </span>
            </p>
            <p>
              <span className="font-medium">Vault Creator:</span>
              <span className="text-sm font-mono block truncate">
                {vault.vault_creator}
              </span>
            </p>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            About This Vault
          </h3>
          <p className="text-black dark:text-white">
            This dual-token vault allows you to take positions on market
            direction. Bull tokens increase in value when the market rises, while
            Bear tokens increase when the market falls. The vault automatically
            rebalances based on price movements.
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p className="text-sm font-mono block truncate">
              Prediction Pool: {tokens.bullToken.prediction_pool}
            </p>
            <p>
              Asset Balance: ${tokens.bullToken.asset_balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};