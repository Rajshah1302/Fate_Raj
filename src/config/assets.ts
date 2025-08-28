export interface AssetConfig {
  coinId: string;   
  name: string;     
  color: string;    
}

export const ASSET_CONFIG: Record<string, AssetConfig> = {
  "18": {
    coinId: "bitcoin",
    name: "BTC/USD",
    color: "#f7931a",
  },
  "19": {
    coinId: "ethereum",
    name: "ETH/USD",
    color: "#627eea",
  },
  "10": {
    coinId: "solana",
    name: "SOL/USDT",
    color: "#66d9e8",
  }
};

