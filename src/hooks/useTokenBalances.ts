import { useState, useEffect } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export const useTokenBalances = (bullTokenId: string, bearTokenId: string) => {
  const [bullAmount, setBullAmount] = useState<number>();
  const [bearAmount, setBearAmount] = useState<number>();
  const { account } = useWallet();
  const DENOMINATOR = 100_000;

  const fetchUserTokenBalances = async (bullTokenId: string, bearTokenId: string, userAddress: string) => {
    const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

    const buildTx = (tokenId: string) => {
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${PACKAGE_ID}::token::get_balance`,
        arguments: [txb.object(tokenId), txb.pure.address(userAddress)],
      });
      return txb;
    };

    const [bullResult, bearResult] = await Promise.all([
      suiClient.devInspectTransactionBlock({
        sender: userAddress,
        transactionBlock: buildTx(bullTokenId),
      }),
      suiClient.devInspectTransactionBlock({
        sender: userAddress,
        transactionBlock: buildTx(bearTokenId),
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getReturnVal = (result: any) => {
      if (
        result.effects.status.status === "success" &&
        result.results?.[0]?.returnValues?.[0]
      ) {
        const [[rawBytes]] = result.results[0].returnValues;
        return Number(BigInt("0x" + Buffer.from(rawBytes).toString("hex")));
      }
      return 0;
    };

    return {
      bull: getReturnVal(bullResult),
      bear: getReturnVal(bearResult),
    };
  };

  useEffect(() => {
    if (!account?.address) return;

    fetchUserTokenBalances(bullTokenId, bearTokenId, account.address)
      .then(({ bull, bear }) => {
        setBullAmount(bull / DENOMINATOR);
        setBearAmount(bear / DENOMINATOR);
      })
      .catch(console.error);
  }, [account?.address, bullTokenId, bearTokenId]);

  return { bullAmount, bearAmount, setBullAmount, setBearAmount };
};
