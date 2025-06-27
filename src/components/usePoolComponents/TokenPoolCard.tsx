/* eslint-disable @typescript-eslint/no-explicit-any */
import { Token } from "@/app/usePool/[id]/types";
import React, { useState, useMemo } from "react";

interface TokenPoolCardProps {
  amount?: number;
  setAmount: (amount: number) => void;
  onBuy: (token: string, amount: number) => void;  
  onSell: (token: string, amount: number) => void; 
  bullPrice?: number;
  bearPrice?: number;
  swapFee?: number;
  bullToken: Token;
  bearToken: Token;
}

export const TokenPoolCard: React.FC<TokenPoolCardProps> = ({
  amount,
  setAmount,
  onBuy,
  onSell,
  bullPrice=1.3,
  bearPrice=.123,
  swapFee=0.1,
  bullToken,
  bearToken,
}) => {
  const [isSuiToToken, setIsSuiToToken] = useState(true);
  const [fromToken, setFromToken] = useState<"sui" | "bull" | "bear">("sui");
  const [toToken, setToToken] = useState<"bull" | "bear">("bull");
  const expectedOutput = useMemo(() => {
    if (!amount || amount <= 0) return 0;

    let outputAmount = 0;

    if (fromToken === "sui") {
      const targetPrice = toToken === "bull" ? bullPrice : bearPrice;
      outputAmount = amount / targetPrice;
    } else {
      const fromPrice = fromToken === "bull" ? bullPrice : bearPrice;
      outputAmount = (amount * fromPrice);
    }

    return outputAmount * (1 - swapFee);
  }, [amount, fromToken, toToken, bullPrice, bearPrice, swapFee]);

  const handleSwapTokens = () => {
    setIsSuiToToken((prev) => !prev);
    setFromToken(toToken);
    setToToken("sui" as any);
    setAmount(0);
  };

  const getTokenSymbol = (tokenType: string) => {
    switch (tokenType) {
      case "sui": return "SUI";
      case "bull": return "BULL";
      case "bear": return "BEAR";
      default: return tokenType.toUpperCase();
    }
  };

  const getTokenColor = (tokenType: string) => {
    switch (tokenType) {
      case "bull": return "text-green-600";
      case "bear": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const handleSwap = () => {
    if (fromToken === "sui") {
      const token = toToken === "bull" ? bullToken : bearToken;
      onBuy(token.id, amount || 0);
    } else {
      const token = fromToken === "bull" ? bullToken : bearToken;
      onSell(token.id, amount || 0);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Token Swap</h3>
      </div>

      <div className="space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
          <div className="flex space-x-2">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {isSuiToToken ? (
                <option value="sui">SUI</option>
              ) : (
                <>
                  <option value="bull">BULL</option>
                  <option value="bear">BEAR</option>
                </>
              )}
            </select>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapTokens}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ↕️
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
          <div className="flex space-x-2">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {!isSuiToToken ? (
                <option value="sui">SUI</option>
              ) : (
                <>
                  <option value="bull">BULL</option>
                  <option value="bear">BEAR</option>
                </>
              )}
            </select>
            <div className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              {expectedOutput.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {amount && amount > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Exchange Rate:</span>
              <span className="text-gray-900 dark:text-white">
                1 {getTokenSymbol(fromToken)} ={" "}
                {((expectedOutput / amount) * (1 + swapFee)).toFixed(4)} {getTokenSymbol(toToken)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Swap Fee ({(swapFee * 100).toFixed(1)}%):</span>
              <span className="text-gray-900 dark:text-white">
                {((expectedOutput * swapFee) / (1 - swapFee)).toFixed(4)} {getTokenSymbol(toToken)}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-900 dark:text-white">You&apos;ll receive:</span>
              <span className={`${getTokenColor(toToken)} font-bold`}>
                {expectedOutput.toFixed(4)} {getTokenSymbol(toToken)}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSwap}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!amount || amount <= 0}
        >
          Swap {getTokenSymbol(fromToken)} for {getTokenSymbol(toToken)}
        </button>
      </div>
    </div>
  );
};
