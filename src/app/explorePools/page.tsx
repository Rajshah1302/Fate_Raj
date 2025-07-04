"use client";
import { useEffect, useState } from "react";
import { PredictionCard } from "@/components/FatePoolCard/FatePoolCard";
import { Search, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SuiClient } from "@mysten/sui/client";
import { useRouter } from "next/navigation";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  vault_creator: string;
  vault_fee: number;
  vault_creator_fee: number;
  treasury_fee: number;
  asset_balance: number;
  supply: number;
  prediction_pool: string;
  other_token: string;
}

interface Pool {
  id: string;
  name: string;
  bullPercentage: number;
  bearPercentage: number;
  bullToken?: Token;
  bearToken?: Token;
  volume?: string;
  participants?: number;
}

interface PoolCreatedEvent {
  pool_id: string;
  bull_token_id: string;
  bear_token_id: string;
  vault_creator: string;
  bull_token_name: string;
  bull_token_symbol: string;
  bear_token_name: string;
  bear_token_symbol: string;
}

const calculateTokenValue = (token: Partial<Token>): number => {
  return token.supply && token.supply > 0 ? (token.asset_balance || 0) / token.supply : 1;
};

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

const ExploreFatePools = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const client = new SuiClient({
    url: 'https://fullnode.testnet.sui.io',
  });

  useEffect(() => {
    const fetchPools = async () => {
      if (!PACKAGE_ID) {
        console.warn("Missing NEXT_PUBLIC_PACKAGE_ID in env");
        setError("Missing package configuration");
        setLoading(false);
        return;
      }

      try {
        // Method 1: Query events for pool creation
        await fetchPoolsFromEvents();
      } catch (eventError) {
        console.warn("Event-based fetching failed, trying direct object query:", eventError);
        // Method 2: Fallback to direct object query
        await fetchPoolsFromObjects();
      }
    };

    const fetchPoolsFromEvents = async () => {
      const MODULE_NAME = "prediction_pool";
      const EVENT_TYPE = "PoolCreated";
      
      // Query events
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::${EVENT_TYPE}`
        },
        limit: 50,
        order: "descending"
      });

      const poolsFromEvents: Pool[] = [];

      for (const event of events.data) {
        try {
          const eventData = event.parsedJson as PoolCreatedEvent;
          
          // Verify pool still exists and get token data
          const [poolExists, bullTokenData, bearTokenData] = await Promise.all([
            client.getObject({
              id: eventData.pool_id,
              options: { showContent: false }
            }).then(res => res.data?.objectId != null).catch(() => false),
            
            client.getObject({
              id: eventData.bull_token_id,
              options: { showContent: true }
            }),
            
            client.getObject({
              id: eventData.bear_token_id,
              options: { showContent: true }
            })
          ]);

          if (!poolExists || !bullTokenData.data?.content || !bearTokenData.data?.content) {
            console.warn(`Skipping invalid pool ${eventData.pool_id}`);
            continue;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parseTokenData = (tokenData: any): Token | null => {
            try {
              if (!tokenData.content || !('fields' in tokenData.content)) {
                return null;
              }
              
              const fields = tokenData.content.fields;
              return {
                id: fields.id?.id || tokenData.objectId,
                name: fields.name || "",
                symbol: fields.symbol || "",
                balance: parseInt(fields.supply || "0"),
                price: calculateTokenValue({
                  supply: parseInt(fields.supply || "0"),
                  asset_balance: parseInt(fields.asset_balance || "0"),
                }),
                vault_creator: fields.vault_creator || "",
                vault_fee: parseInt(fields.vault_fee || "0"),
                vault_creator_fee: parseInt(fields.vault_creator_fee || "0"),
                treasury_fee: parseInt(fields.treasury_fee || "0"),
                asset_balance: parseInt(fields.asset_balance || "0"),
                supply: parseInt(fields.supply || "0"),
                prediction_pool: fields.prediction_pool || "",
                other_token: fields.other_token || "",
              };
            } catch (error) {
              console.error("Error parsing token data:", error);
              return null;
            }
          };

          const bullToken = parseTokenData(bullTokenData.data);
          const bearToken = parseTokenData(bearTokenData.data);

          if (!bullToken || !bearToken) {
            console.warn(`Invalid token data for pool ${eventData.pool_id}`);
            continue;
          }

          // Calculate percentages
          const totalValue = bullToken.price * bullToken.balance + bearToken.price * bearToken.balance;
          const bullPercentage = totalValue > 0
            ? (bullToken.price * bullToken.balance) / totalValue * 100
            : 50;

          poolsFromEvents.push({
            id: eventData.pool_id,
            name: `${bullToken.symbol}/${bearToken.symbol} Pool`,
            bullPercentage,
            bearPercentage: 100 - bullPercentage,
            bullToken,
            bearToken,
          });

        } catch (error) {
          console.error(`Error processing event for pool:`, error);
        }
      }

      setPools(poolsFromEvents);
      setLoading(false);
    };

    const fetchPoolsFromObjects = async () => {
      try {
        const PREDICTION_POOL_TYPE = `${PACKAGE_ID}::prediction_pool::PredictionPool`;
        
         await client.getOwnedObjects({
          owner: "0x0", 
          filter: {
            StructType: PREDICTION_POOL_TYPE
          },
          options: {
            showContent: true,
            showType: true
          }
        });

        console.warn("Direct object query may not work for shared objects");
        setPools([]);
        setLoading(false);
      } catch (error) {
        console.error("Direct object query failed:", error);
        setError("Unable to fetch pools. Please try again later.");
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const filteredPools = pools.filter((pool) =>
    pool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 mt-10">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                Explore Fate Pools
              </h1>
              {error && (
                <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
              )}
            </div>
            <button
              className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 dark:bg-white dark:text-black shadow-md"
              onClick={() => router.push('/createPool')}
            >
              <Plus size={20} />
              Create New Pool
            </button>
          </div>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-lg">
              <div className="relative w-full md:w-auto">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:text-white dark:bg-gray-900/60 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 outline-none transition-all"
                />
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Pools
                  </p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {pools.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] bg-white dark:bg-gray-700/30 rounded-xl shadow-lg animate-pulse"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-600/50 rounded-t-xl" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600/50 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-600/50 rounded w-1/2" />
                    <div className="h-24 bg-gray-200 dark:bg-gray-600/50 rounded" />
                  </div>
                </div>
              ))
            ) : filteredPools.length > 0 ? (
              filteredPools.map((pool) => (
                <div key={pool.id}>
                  <PredictionCard
                    name={pool.name}
                    bullPercentage={pool.bullPercentage}
                    bearPercentage={pool.bearPercentage}
                    bullCoinName={pool.bullToken?.name || "Bull Token"}
                    bullCoinSymbol={pool.bullToken?.symbol || "BULL"}
                    bearCoinName={pool.bearToken?.name || "Bear Token"}
                    bearCoinSymbol={pool.bearToken?.symbol || "BEAR"}
                    onUse={() => {
                      router.push(`/usePool/${encodeURIComponent(pool.id)}`)
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {pools.length === 0 ? "No pools found. Create the first one!" : "No pools matching your search"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ExploreFatePools;