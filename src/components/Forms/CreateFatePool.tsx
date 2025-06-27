"use client";

import "dotenv/config";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Coins, Wallet, Percent } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Transaction } from "@mysten/sui/transactions";
import { useWallet } from "@suiet/wallet-kit";

export default function CreateFatePoolForm() {
  const { account, signAndExecuteTransaction } = useWallet();
  const router = useRouter();
  // Separate state variables for each field
  const [poolName, setPoolName] = useState("");
  const [bullCoinName, setBullCoinName] = useState("");
  const [bullCoinSymbol, setBullCoinSymbol] = useState("");
  const [bearCoinName, setBearCoinName] = useState("");
  const [bearCoinSymbol, setBearCoinSymbol] = useState("");
  //const [erc20Address, setErc20Address] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [creatorStakeFee, setCreatorStakeFee] = useState("");
  const [creatorUnstakeFee, setCreatorUnstakeFee] = useState("");
  const [stakeFee, setStakeFee] = useState("");
  const [unstakeFee, setUnstakeFee] = useState("");
  //const [reallocationFactor, setReallocationFactor] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      poolName,
      bullCoinName,
      bullCoinSymbol,
      bearCoinName,
      bearCoinSymbol,
      //erc20Address,
      creatorAddress,
      creatorStakeFee,
      creatorUnstakeFee,
      stakeFee,
      unstakeFee,
      //reallocationFactor,
    };

    console.log("Form submitted:", formData);

    if (!account?.address) {
      alert("Please connect your wallet.");
      return;
    }

    const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

    if (!PACKAGE_ID) {
      alert("PACKAGE_ID not defined in .env");
      return;
    }

    try {
      const tx = new Transaction();

      const vault_creator = formData.creatorAddress || account.address;
      const vault_fee = parseInt(formData.stakeFee || "0");
      const vault_creator_fee = parseInt(formData.creatorStakeFee || "0");
      const treasury_fee = parseInt(formData.unstakeFee || "0");

      // const priceIdHex =
        // "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744";

      tx.moveCall({
        target: `${PACKAGE_ID}::prediction_pool::create_prediction_pool`,
        arguments: [
          tx.pure.address(vault_creator),
          tx.pure.u64(vault_fee),
          tx.pure.u64(vault_creator_fee),
          tx.pure.u64(treasury_fee),
          // tx.pure.string("Bull Token"), // bull_name
          // tx.pure.string("BULL"), // bull_symbol
          // tx.pure.string("Bear Token"), // bear_name
          // tx.pure.string("BEAR"), // bear_symbol
          // tx.pure.string(priceIdHex), // asset_id_hex as string
        ],
      });
      tx.setGasBudget(20000000);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      router.push("/explorePools");
      console.log("Transaction result:", result);
      alert("Prediction Pool created successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Transaction error:", err);
      alert(`Transaction failed: ${err.message || err}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-black p-6 rounded-xl my-10">
        <Card className="shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-2xl font-bold text-black dark:text-white">
              Create Fate Pool
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Configure your new Fate Pool with bull and bear tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Pool Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Pool Configuration
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label
                    htmlFor="poolName"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Name of the Fate Pool
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        <p className="w-64 text-sm">
                          Enter a unique and descriptive name for your Fate Pool
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="text"
                  id="poolName"
                  name="poolName"
                  placeholder="e.g. FateBTC"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                />
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Token Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Token Configuration
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Bull Coin Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <Label
                        htmlFor="bullCoinName"
                        className="text-sm font-medium text-gray-600 dark:text-gray-400"
                      >
                        Bull Coin Name
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <p className="w-64 text-sm">
                              Name for the bullish token
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="text"
                      id="bullCoinName"
                      name="bullCoinName"
                      placeholder="e.g. BullToken"
                      value={bullCoinName}
                      onChange={(e) => setBullCoinName(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  {/* Bull Coin Symbol */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <Label
                        htmlFor="bullCoinSymbol"
                        className="text-sm font-medium text-gray-600 dark:text-gray-400"
                      >
                        Bull Coin Symbol
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <p className="w-64 text-sm">
                              Trading symbol for the bullish token
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="text"
                      id="bullCoinSymbol"
                      name="bullCoinSymbol"
                      placeholder="e.g. BTCBULL"
                      value={bullCoinSymbol}
                      onChange={(e) => setBullCoinSymbol(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Bear Coin Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <Label
                        htmlFor="bearCoinName"
                        className="text-sm font-medium text-gray-600 dark:text-gray-400"
                      >
                        Bear Coin Name
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <p className="w-64 text-sm">
                              Name for the bearish token
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="text"
                      id="bearCoinName"
                      name="bearCoinName"
                      placeholder="e.g. BearToken"
                      value={bearCoinName}
                      onChange={(e) => setBearCoinName(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  {/* Bear Coin Symbol */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <Label
                        htmlFor="bearCoinSymbol"
                        className="text-sm font-medium text-gray-600 dark:text-gray-400"
                      >
                        Bear Coin Symbol
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <p className="w-64 text-sm">
                              Trading symbol for the bearish token
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="text"
                      id="bearCoinSymbol"
                      name="bearCoinSymbol"
                      placeholder="e.g. BTCBEAR"
                      value={bearCoinSymbol}
                      onChange={(e) => setBearCoinSymbol(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Address Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Address Configuration
              </h3>
              {/* ERC20 Reserve Asset Address 
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label
                    htmlFor="erc20Address"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    ERC20 Reserve Asset Address
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        <p className="w-64 text-sm">
                          The address of the ERC20 token that will be used as the reserve asset
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="text"
                  id="erc20Address"
                  name="erc20Address"
                  placeholder="0x..."
                  value={erc20Address}
                  onChange={(e) => setErc20Address(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                />
              </div>
              */}
              {/* Fee Recipient Address */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label
                    htmlFor="creatorAddress"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Fee Recipient Address
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        <p className="w-64 text-sm">
                          The address that will receive the creator&apos;s
                          portion of vault fees
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="text"
                  id="creatorAddress"
                  name="creatorAddress"
                  placeholder="0x..."
                  value={creatorAddress}
                  onChange={(e) => setCreatorAddress(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                />
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Fee Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Fee Configuration
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Creator Stake Fee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Label
                      htmlFor="creatorStakeFee"
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Creator Stake Fee
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                          <p className="w-64 text-sm">
                            Percentage of stake fees allocated to the creator
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="creatorStakeFee"
                    name="creatorStakeFee"
                    placeholder="%"
                    step="0.01"
                    value={creatorStakeFee}
                    onChange={(e) => setCreatorStakeFee(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
                {/* Creator Unstake Fee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Label
                      htmlFor="creatorUnstakeFee"
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Creator Unstake Fee
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                          <p className="w-64 text-sm">
                            Percentage of unstake fees allocated to the creator
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="creatorUnstakeFee"
                    name="creatorUnstakeFee"
                    placeholder="%"
                    step="0.01"
                    value={creatorUnstakeFee}
                    onChange={(e) => setCreatorUnstakeFee(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
                {/* Stake Fee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Label
                      htmlFor="stakeFee"
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Stake Fee
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                          <p className="w-64 text-sm">
                            Total percentage fee charged on staking
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="stakeFee"
                    name="stakeFee"
                    placeholder="%"
                    step="0.01"
                    value={stakeFee}
                    onChange={(e) => setStakeFee(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
                {/* Unstake Fee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Label
                      htmlFor="unstakeFee"
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Unstake Fee
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                          <p className="w-64 text-sm">
                            Total percentage fee charged on unstaking
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="unstakeFee"
                    name="unstakeFee"
                    placeholder="%"
                    step="0.01"
                    value={unstakeFee}
                    onChange={(e) => setUnstakeFee(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Reallocation Configuration 
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Reallocation Configuration
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <Label
                    htmlFor="reallocationFactor"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Reallocation Factor
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        <p className="w-64 text-sm">
                          The factor that determines how assets are reallocated between bull and bear tokens
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="reallocationFactor"
                  name="reallocationFactor"
                  placeholder="%"
                  step="0.01"
                  value={reallocationFactor}
                  onChange={(e) => setReallocationFactor(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white"
                />
              </div>
            </div>
            */}
            <Button
              type="submit"
              className="w-full mt-6 text-lg h-12 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Create Fate Pool
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
