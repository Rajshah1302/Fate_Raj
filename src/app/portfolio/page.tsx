/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PieChartIcon,
  BarChart3,
  Wallet,
  Activity,
  DollarSign,
} from "lucide-react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StickyCursor from "@/components/StickyCursor";
import { usePool } from "@/fateHooks/usePool";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useWallet } from "@suiet/wallet-kit";
import { useRouter } from "next/navigation";
import AppLoader from "@/components/Loader";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const REGISTRY_ID =
  process.env.NEXT_GLOBAL_REGISTRY ||
  "0x48fbdd71557a10315f14658ee6f855803d62402db5e77a90801df90407b43e2a";

const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

const WEI_DIVISOR = 1e9;

// Safe number utility
const safeNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return isFinite(num) && !isNaN(num) ? num : fallback;
};

// Calculate token metrics
const calculateTokenMetrics = (
  reserve: number,
  supply: number,
  userTokens: number,
  avgPrice: number
) => {
  const price = safeNumber(supply > 0 ? reserve / supply : 0);
  const currentValue = userTokens * price;
  const costBasis = userTokens * avgPrice;
  const pnL = currentValue - costBasis;
  const returns =
    userTokens === 0 || avgPrice === 0 ? 0 : (pnL / costBasis) * 100;

  return { price, currentValue, costBasis, pnL, returns };
};

interface PoolData {
  id: string;
  name: string;
  bullBalance: number;
  bearBalance: number;
  bullCurrentValue: number;
  bearCurrentValue: number;
  totalValue: number;
  totalCostBasis: number;
  bullPnL: number;
  bearPnL: number;
  totalPnL: number;
  bullPrice: number;
  bearPrice: number;
  bullAvgPrice: number;
  bearAvgPrice: number;
  bullReturns: number;
  bearReturns: number;
  color: string;
  hasPositions: boolean;
  bullReserve: number;
  bearReserve: number;
  bullSupply: number;
  bearSupply: number;
}

// Enhanced summary card component with animations
const SummaryCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: "up" | "down" | "neutral";
}) => (
  <Card className="group relative overflow-hidden  border-neutral-200/60 dark:border-neutral-700/60 dark:bg-gradient-to-br dark:from-neutral-800/50 dark:to-neutral-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/50 dark:hover:border-blue-500/30">
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
        {title}
      </CardTitle>
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full blur-sm opacity-20 ${
            trend === "up"
              ? "bg-green-400"
              : trend === "down"
              ? "bg-red-400"
              : "bg-neutral-400"
          }`}
        />
        <Icon
          className={`relative h-5 w-5 transition-all duration-300 group-hover:scale-110 ${
            trend === "up"
              ? "text-green-500 dark:text-green-400"
              : trend === "down"
              ? "text-red-500 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        />
      </div>
    </CardHeader>
    <CardContent>
      <div
        className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${
          trend === "up"
            ? "text-green-600 dark:text-green-400"
            : trend === "down"
            ? "text-red-600 dark:text-red-400"
            : "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        {value}
      </div>
      {trend && trend !== "neutral" && (
        <div className="mt-1 flex items-center text-xs opacity-70">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
          )}
          <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
            {trend === "up" ? "Profit" : "Loss"}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

// Enhanced position card component
const PositionCard = ({ pool }: { pool: PoolData }) => {
  const router = useRouter();
  return (
    <div
      className="group relative overflow-hidden border border-neutral-200/60 dark:border-neutral-600/60 rounded-xl p-5 dark:bg-gradient-to-br dark:from-neutral-700/40 dark:to-neutral-800/40 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-500/30"
      onClick={() => {
        router.push(`predictionPool/pool?id=${pool.id}`);
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 w-1 h-full transition-all duration-300 group-hover:w-2"
        style={{ backgroundColor: pool.color }}
      />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-3 rounded-full shadow-lg"
            style={{ backgroundColor: pool.color }}
          />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {pool.name}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {pool.totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 4,
            })}{" "}
            SUI
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              pool.totalPnL >= 0
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {pool.totalPnL > 0.1 ? "+" : ""}
            {pool.totalPnL.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 4,
            })}{" "}
            SUI (
            {pool.totalCostBasis > 0
              ? ((pool.totalPnL / pool.totalCostBasis) * 100).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }
                )
              : "0"}
            % )
          </div>
        </div>
      </div>

      {/* Position details */}
      <div className="relative flex justify-between text-xs">
        <div className="space-y-1 text-left">
          <div className="text-neutral-600 dark:text-neutral-400">
            Bull Position
          </div>
          <div className="font-medium text-green-600 dark:text-green-400">
            {pool.bullBalance.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            tokens
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-neutral-600 dark:text-neutral-400">
            Bear Position
          </div>
          <div className="font-medium text-red-600 dark:text-red-400">
            {pool.bearBalance.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            tokens
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual pool data loader component
const PoolDataLoader = ({
  poolId,
  index,
  userAddress,
  onDataLoad,
}: {
  poolId: string;
  index: number;
  userAddress?: string;
  onDataLoad: (data: PoolData) => void;
}) => {
  const { pool, userBalances, userAvgPrices, loading, error } = usePool(
    poolId,
    userAddress
  );

  useEffect(() => {
    if (loading || error || !pool || !userBalances) return;

    // Convert from wei - using correct field names from usePool hook
    const bullReserve = safeNumber(pool.bull_reserve) / WEI_DIVISOR;
    const bearReserve = safeNumber(pool.bear_reserve) / WEI_DIVISOR;

    // Get supply from token fields (correct structure based on usePool)
    const bullSupply =
      safeNumber(pool.bull_token?.fields?.total_supply) / WEI_DIVISOR;
    const bearSupply =
      safeNumber(pool.bear_token?.fields?.total_supply) / WEI_DIVISOR;

    const userBullTokens = safeNumber(userBalances.bull_tokens) / WEI_DIVISOR;
    const userBearTokens = safeNumber(userBalances.bear_tokens) / WEI_DIVISOR;
    const bullAvgPrice = safeNumber(userAvgPrices?.bull_avg_price);
    const bearAvgPrice = safeNumber(userAvgPrices?.bear_avg_price);

    console.log("Pool data processing:", {
      poolId,
      poolName: pool.name,
      bullReserve,
      bearReserve,
      bullSupply,
      bearSupply,
      userBullTokens,
      userBearTokens,
      bullAvgPrice,
      bearAvgPrice,
    });

    const bullMetrics = calculateTokenMetrics(
      bullReserve,
      bullSupply,
      userBullTokens,
      bullAvgPrice
    );
    const bearMetrics = calculateTokenMetrics(
      bearReserve,
      bearSupply,
      userBearTokens,
      bearAvgPrice
    );

    const poolData: PoolData = {
      id: poolId,
      name: pool.name || `Pool ${index + 1}`,
      bullBalance: userBullTokens,
      bearBalance: userBearTokens,
      bullCurrentValue: bullMetrics.currentValue,
      bearCurrentValue: bearMetrics.currentValue,
      totalValue: bullMetrics.currentValue + bearMetrics.currentValue,
      totalCostBasis: bullMetrics.costBasis + bearMetrics.costBasis,
      bullPnL: bullMetrics.pnL,
      bearPnL: bearMetrics.pnL,
      totalPnL: bullMetrics.pnL + bearMetrics.pnL,
      bullPrice: bullMetrics.price,
      bearPrice: bearMetrics.price,
      bullAvgPrice,
      bearAvgPrice,
      bullReturns: bullMetrics.returns,
      bearReturns: bearMetrics.returns,
      color: CHART_COLORS[index % CHART_COLORS.length],
      hasPositions: userBullTokens > 0 || userBearTokens > 0,
      bullReserve,
      bearReserve,
      bullSupply,
      bearSupply,
    };

    console.log("Processed pool data:", poolData);
    onDataLoad(poolData);
  }, [
    loading,
    error,
    pool,
    userBalances,
    userAvgPrices,
    poolId,
    index,
    onDataLoad,
  ]);

  // Show individual loading errors for debugging
  if (error) {
    console.error(`Error loading pool ${poolId}:`, error);
  }

  return null;
};

// Main component
export default function PortfolioPage() {
  const { account } = useWallet();
  const stickyRef = useRef<HTMLElement | null>(null);
  const [showPoolDistribution, setShowPoolDistribution] = useState(false);
  const [userPoolIds, setUserPoolIds] = useState<string[]>([]);
  const [poolsData, setPoolsData] = useState<PoolData[]>([]);
  const [loadedPoolsCount, setLoadedPoolsCount] = useState(0);
  const [registryError, setRegistryError] = useState<string>("");

  // Fetch user pools from registry
  const fetchUserPoolsFromRegistry = useCallback(async (): Promise<
    string[]
  > => {
    if (!account?.address) return [];

    try {
      console.log("Fetching pools for address:", account.address);
      const client = new SuiClient({
        url: "https://fullnode.testnet.sui.io:443",
      });
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::registry::get_user_pools`,
        arguments: [tx.object(REGISTRY_ID), tx.pure.address(account.address)],
      });

      const response = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: account.address,
      });

      console.log("Registry response:", response);

      if (response.error) {
        console.error("Registry call error:", response.error);
        setRegistryError(response.error);
        return [];
      }

      const returnValues = response.results?.[0]?.returnValues?.[0];
      if (!returnValues || !Array.isArray(returnValues)) {
        console.log("No return values or invalid format");
        return [];
      }

      const byteArray = Uint8Array.from(returnValues[0]);
      const poolIds = bcs.vector(bcs.Address).parse(byteArray);
      console.log("Fetched pool IDs:", poolIds);
      setRegistryError("");
      return poolIds;
    } catch (err: any) {
      console.error("Error fetching pools from registry:", err);
      setRegistryError(err?.message || "Failed to fetch pools");
      return [];
    }
  }, [account?.address]);

  useEffect(() => {
    let isMounted = true;

    const loadUserPools = async () => {
      const poolIds = await fetchUserPoolsFromRegistry();
      if (isMounted) {
        setUserPoolIds(poolIds);
        setPoolsData([]);
        setLoadedPoolsCount(0);
        console.log("Set user pool IDs:", poolIds);
      }
    };

    if (account?.address) {
      loadUserPools();
    } else {
      setUserPoolIds([]);
      setPoolsData([]);
      setLoadedPoolsCount(0);
      setRegistryError("");
    }

    return () => {
      isMounted = false;
    };
  }, [account?.address, fetchUserPoolsFromRegistry]);

  // Handle pool data loading
  const handlePoolDataLoad = useCallback((data: PoolData) => {
    console.log("Received pool data:", data);
    setPoolsData((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === data.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        setLoadedPoolsCount((prevCount) => prevCount + 1);
        return [...prev, data];
      }
    });
  }, []);

  // Calculate portfolio statistics
  const {
    activePoolsData,
    totalPortfolioValue,
    totalPnL,
    totalReturnPercentage,
  } = useMemo(() => {
    const activePoolsData = poolsData.filter((pool) => pool.hasPositions);

    const totalPortfolioValue = activePoolsData.reduce(
      (sum, pool) => sum + pool.totalValue,
      0
    );
    const totalCostBasis = activePoolsData.reduce(
      (sum, pool) => sum + pool.totalCostBasis,
      0
    );
    const totalPnL = activePoolsData.reduce(
      (sum, pool) => sum + pool.totalPnL,
      0
    );
    const totalReturnPercentage =
      totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

    return {
      activePoolsData,
      totalPortfolioValue,
      totalCostBasis,
      totalPnL,
      totalReturnPercentage,
    };
  }, [poolsData]);

  const isLoading =
    userPoolIds.length > 0 && loadedPoolsCount < userPoolIds.length;

  if (!account?.address) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-100 dark:from-neutral-900 dark:via-blue-950/20 dark:to-neutral-900 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md border-neutral-200/60 dark:border-neutral-700/60 shadow-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <div className="mb-6">
              <Wallet className="h-12 w-12 mx-auto text-blue-500 dark:text-blue-400 mb-4" />
              <CardTitle className="text-xl mb-2 text-neutral-900 dark:text-neutral-100">
                Connect Your Wallet
              </CardTitle>
              <p className="text-neutral-600 dark:text-neutral-400">
                Connect your wallet to view your portfolio and manage your
                positions
              </p>
            </div>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppLoader minDuration={500}>
        <Navbar />
        <StickyCursor stickyRef={stickyRef} />
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Debug Info */}
            {registryError && (
              <Card className="border-red-200/60 dark:border-red-800/60 bg-gradient-to-r from-red-50/80 to-red-100/60 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                    Registry Error: {registryError}
                  </p>
                </div>
              </Card>
            )}

            {/* Loading state */}
            {isLoading && (
              <AppLoader minDuration={300}>
                <div className="text-center text-neutral-600 dark:text-neutral-400">
                  Loading your pools...
                </div>
              </AppLoader>
            )}

            {/* Pool Data Loaders - Hidden components that load data */}
            {userPoolIds.map((poolId, index) => (
              <PoolDataLoader
                key={poolId}
                poolId={poolId}
                index={index}
                userAddress={account?.address}
                onDataLoad={handlePoolDataLoad}
              />
            ))}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                title="Total Portfolio Value"
                value={`${totalPortfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                })} SUI`}
                icon={DollarSign}
                trend="neutral"
              />
              <SummaryCard
                title="Total P&L"
                value={`${totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  }
                )} SUI`}
                icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
                trend={totalPnL >= 0 ? "up" : "down"}
              />
              <SummaryCard
                title="Total Return %"
                value={`${
                  totalReturnPercentage >= 0 ? "+" : ""
                }${totalReturnPercentage.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}%`}
                icon={Activity}
                trend={totalReturnPercentage >= 0 ? "up" : "down"}
              />
            </div>

            {activePoolsData.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 ">
                {/* Portfolio Distribution Chart */}
                <Card className="xl:col-span-3 border-neutral-200/60 dark:border-neutral-700/60 dark:bg-gradient-to-br dark:from-neutral-800/50 dark:to-neutral-900/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                          Portfolio Distribution
                        </CardTitle>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Asset allocation across {activePoolsData.length} pool
                          {activePoolsData.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowPoolDistribution(!showPoolDistribution)
                        }
                        className="border-neutral-300/60 dark:border-neutral-600/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
                      >
                        {showPoolDistribution ? (
                          <PieChartIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <BarChart3 className="h-4 w-4 mr-2" />
                        )}
                        {showPoolDistribution ? "Pie View" : "Bar View"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      {showPoolDistribution ? (
                        <BarChart data={activePoolsData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e5e5"
                            strokeOpacity={0.3}
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#737373"
                            fontSize={12}
                            tickFormatter={(name) =>
                              name.length > 10
                                ? `${name.substring(0, 10)}...`
                                : name
                            }
                          />
                          <YAxis stroke="#737373" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e5e5e5",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              color: "#000",
                            }}
                            formatter={(value: number) => [
                              `${value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 4,
                              })} SUI`,
                              "Value",
                            ]}
                          />
                          <Bar dataKey="totalValue" radius={[6, 6, 0, 0]}>
                            {activePoolsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={activePoolsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={140}
                            paddingAngle={2}
                            dataKey="totalValue"
                          >
                            {activePoolsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [
                              `${value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 4,
                              })} SUI`,
                              "Value",
                            ]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e5e5e5",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-6 flex-wrap">
                      {activePoolsData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Positions */}
                <Card className="border-neutral-200/60 xl:col-span-2  dark:border-neutral-700/60 dark:bg-gradient-to-br dark:from-neutral-800/50 dark:to-neutral-900/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      Active Positions
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {activePoolsData.length} position
                        {activePoolsData.length !== 1 ? "s" : ""} active
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto overfolw-x-hidden pr-2">
                      {activePoolsData.map((pool, index) => (
                        <div
                          key={pool.id}
                          className="animate-in slide-in-from-bottom-4 duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <PositionCard pool={pool} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : !isLoading ? (
              <Card className="border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-8 text-center">
                <CardTitle className="text-neutral-900 dark:text-neutral-100 mb-2">
                  No Active Positions
                </CardTitle>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {userPoolIds.length === 0
                    ? "You don't have any pools in the registry yet."
                    : "You don't have any active positions in your pools yet."}
                </p>
              </Card>
            ) : null}
          </div>
        </div>
        <Footer />
      </AppLoader>
    </>
  );
}
