
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract, Eip1193Provider, formatUnits } from "ethers";
import { FC, useEffect, useState } from "react";

const ERC20_ABI = [
	"function balanceOf(address owner) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)"
];

interface TokenDisplayProps {
	tokenAddress: string;
	tokenName?: string; // If not provided, will try to fetch symbol
	tokenIcon?: string;
	decimals?: number; // If not provided, will try to fetch decimals
}

export const TokenDisplay: FC<TokenDisplayProps> = ({ tokenAddress, tokenName, tokenIcon, decimals }) => {
	const { address, isConnected } = useAppKitAccount();
	const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

	const [balance, setBalance] = useState<string>("0");
	const [symbol, setSymbol] = useState<string>(tokenName || "");
	const [loading, setLoading] = useState<boolean>(false);

	const fetchBalance = async () => {
		if (!isConnected || !address || !walletProvider) return;

		setLoading(true);
		try {
			const ethersProvider = new BrowserProvider(walletProvider);
			const contract = new Contract(tokenAddress, ERC20_ABI, ethersProvider);

			const [bal, dec, sym] = await Promise.all([
				contract.balanceOf(address),
				decimals !== undefined ? decimals : contract.decimals().catch(() => 18),
				tokenName ? tokenName : contract.symbol().catch(() => "TOKEN")
			]);

			setBalance(formatUnits(bal, dec));
			if (!tokenName) setSymbol(sym);

		} catch (error) {
			console.error("Failed to fetch token balance:", error);
			setBalance("0");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isConnected && address) {
			fetchBalance();
		} else {
			setBalance("0");
		}
	}, [isConnected, address, walletProvider, tokenAddress]);

	if (!isConnected) return null;

	return (
		<div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
			{tokenIcon && (
				<img src={tokenIcon} alt={symbol} className="w-5 h-5 rounded-full" />
			)}
			<div className="flex flex-col leading-none">
				<span className="text-white font-medium text-sm">
					{loading ? "..." : parseFloat(balance).toFixed(3)} {symbol}
				</span>
			</div>
		</div>
	);
};
