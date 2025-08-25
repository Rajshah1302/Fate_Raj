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
  "0x73dc009953c83c944690037ea477df627657f45c14f16ad3a61089c5a3f9f4f2": {
    coinId: "cardano",
    name: "ADA/USD",
    color: "#0033ad",
  },
};
