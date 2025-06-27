/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from "@mysten/sui/transactions";
import { useWallet } from "@suiet/wallet-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export const useWalletTransactions = () => {
  const { account, signAndExecuteTransaction } = useWallet();
  const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const DENOMINATOR = 100_000;

  const calculateTokensFromSui = async (
    tokenId: string,
    suiAmount: number
  ): Promise<number> => {
    const buyRate = await getBuyRate(tokenId);
    return suiAmount * buyRate;
  };

  const calculateSuiFromTokens = async (
    tokenId: string,
    tokenAmount: number
  ): Promise<number> => {
    const sellRate = await getSellRate(tokenId);
    return tokenAmount * sellRate;
  };
  const handleBuy = async (tokenId: string, amount: number) => {
    try {
      const tx = new Transaction();
      const amountInMist = BigInt(amount * 1_000_000_000);

      // Get all SUI coins
      const { data: coins } = await suiClient.getCoins({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      });

      if (coins.length === 0) {
        alert("No SUI coins found in wallet");
        return;
      }

      // Calculate total balance
      const totalBalance = coins.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      );
      console.log(`Total SUI balance: ${Number(totalBalance) / 1_000_000_000}`);
      console.log(`Amount needed: ${Number(amountInMist) / 1_000_000_000}`);

      // Check if we have enough (including gas buffer)
      const gasBuffer = 100_000_000n; // 0.1 SUI buffer for gas
      if (totalBalance < amountInMist + gasBuffer) {
        alert(
          `Insufficient balance. Need ${
            Number(amountInMist + gasBuffer) / 1_000_000_000
          } SUI (including gas), but have ${
            Number(totalBalance) / 1_000_000_000
          } SUI`
        );
        return;
      }

      // Use tx.splitCoins with gas coin automatically handled
      const [paymentCoin] = tx.splitCoins(tx.gas, [amountInMist]);

      tx.moveCall({
        target: `${PACKAGE_ID}::token::buy`,
        arguments: [
          tx.object(tokenId),
          paymentCoin,
          tx.pure.address(account.address),
        ],
      });

      tx.setGasBudget(11_000_000);
      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("Buy success:", result);
      alert("Deposit successful!");
    } catch (error: any) {
      console.error("Buy failed:", error);
      alert(`Deposit failed: ${error.message || error}`);
    }
  };

  const handleSell = async (tokenId: string, amount: number) => {
    if (!amount || amount <= 0) {
      alert("❗ Please enter a valid withdraw amount greater than 0");
      return;
    }

    if (!account?.address) {
      alert("❗ Please connect your wallet");
      return;
    }

    if (!PACKAGE_ID) {
      alert("❗ Missing PACKAGE_ID in environment variables");
      return;
    }

    try {
      const rawTokenAmount = amount * DENOMINATOR;
      const floored = Math.floor(rawTokenAmount);

      if (floored < 1) {
        alert("❗ Amount too small. Must result in at least 1 token unit.");
        return;
      }

      const amountInTokenUnits = BigInt(floored);

      // Check user's balance by calling the Move contract's get_balance function
      console.log("🔍 Checking user balance...");

      const balanceCheckTx = new Transaction();
      balanceCheckTx.moveCall({
        target: `${PACKAGE_ID}::token::get_balance`,
        arguments: [
          balanceCheckTx.object(tokenId),
          balanceCheckTx.pure.address(account.address),
        ],
      });

      // This is a view call, so we can simulate it without gas
      const balanceResult = await suiClient.devInspectTransactionBlock({
        transactionBlock: balanceCheckTx,
        sender: account.address,
      });

      let userBalance = 0n;
      if (balanceResult.results?.[0]?.returnValues?.[0]) {
        const balanceBytes = balanceResult.results[0].returnValues[0][0];
        userBalance = BigInt("0x" + Buffer.from(balanceBytes).toString("hex"));
      }

      console.log("💰 Balance check:", {
        userBalance: userBalance.toString(),
        requestedAmount: amountInTokenUnits.toString(),
        hasEnoughBalance: userBalance >= amountInTokenUnits,
      });

      // Check if user has enough balance
      if (userBalance < amountInTokenUnits) {
        alert(
          `❗ Insufficient balance. You have ${userBalance} tokens but trying to sell ${amountInTokenUnits}`
        );
        return;
      }

      // Get token supply to double-check
      const tokenObject = await suiClient.getObject({
        id: tokenId,
        options: { showContent: true },
      });

      if (tokenObject.data?.content && "fields" in tokenObject.data.content) {
        const tokenFields = tokenObject.data.content.fields as any;
        const totalSupply = BigInt(tokenFields.supply || 0);

        console.log("📊 Supply check:", {
          totalSupply: totalSupply.toString(),
          requestedAmount: amountInTokenUnits.toString(),
          isValidAmount: amountInTokenUnits <= totalSupply,
        });

        if (amountInTokenUnits > totalSupply) {
          alert(
            `❗ Cannot sell ${amountInTokenUnits} tokens. Total supply is only ${totalSupply}`
          );
          return;
        }
      }

      alert(
        `🔄 You are trying to sell ${amount} → ${amountInTokenUnits} token units`
      );

      const tx = new Transaction();

      // Check SUI balance for gas
      const { data: coins } = await suiClient.getCoins({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      });

      if (coins.length === 0) {
        alert("❗ No SUI coins found for gas");
        return;
      }

      const totalBalance = coins.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      );
      const gasBuffer = 100_000_000n;

      if (totalBalance < gasBuffer) {
        alert("❗ Not enough SUI for gas");
        return;
      }

      console.log("🚀 Transaction details:", {
        target: `${PACKAGE_ID}::token::sell`,
        tokenId,
        amount: amountInTokenUnits.toString(),
      });

      tx.moveCall({
        target: `${PACKAGE_ID}::token::sell`,
        arguments: [
          tx.object(tokenId),
          tx.pure.u64(amountInTokenUnits.toString()),
        ],
      });

      tx.setGasBudget(11_000_000);

      const result = await signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      console.log("✅ Transaction result:", result);
      alert("✅ Withdraw successful! Transaction: " + result.digest);
    } catch (error: any) {
      console.error("❌ Full error details:", error);

      if (error.message?.includes("MoveAbort")) {
        const abortMatch = error.message.match(/MoveAbort.*?(\d+)/);
        const abortCode = abortMatch ? abortMatch[1] : "unknown";

        let errorMessage = `Move contract error (code ${abortCode}): `;

        switch (abortCode) {
          case "1":
            errorMessage +=
              "Insufficient token supply - you're trying to sell more tokens than exist in total supply.";
            break;
          case "2":
            errorMessage += "Zero amount - the amount must be greater than 0.";
            break;
          case "5":
            errorMessage +=
              "Insufficient balance - you don't have enough tokens to sell.";
            break;
          default:
            errorMessage +=
              "Check the Move contract for this error code meaning.";
        }

        alert(`❌ ${errorMessage}`);
      } else {
        alert(`❌ Withdraw failed: ${error.message || error}`);
      }
    }
  };
  return {
    handleBuy,
    handleSell,
    calculateTokensFromSui,
    calculateSuiFromTokens,
  };
};
