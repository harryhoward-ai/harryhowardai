import HHAIcon from "@/icons/howardai-icon.png";
import XPIcon from "@/icons/xp-icon.svg";
import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { Header } from "@/pages/Launchpad/components/Header";
import { Env, ExchangeApi, ExchangeHistoryItem, ExchangeInfo, getEnv } from "@/utils/Api";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { ChevronRight } from "lucide-react";
import { FC, useEffect, useState } from "react";
// import { formatNumber } from "@/constats";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

import { useDashFunCoins } from "@/components/DashFun/DashFunCoins";

export const TokenExchangePage: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [info, setInfo] = useState<ExchangeInfo | null>(null);
	const [history, setHistory] = useState<ExchangeHistoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	const [amountInput, setAmountInput] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

	const { address, isConnected } = useAppKitAccount();
	const { open } = useAppKit();

	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();
	// Get DashFunPoint (XP) balance
	const coinInfo = getCoinInfo(info?.config.point_name || "NolanDevPoint", "name");
	const userPointBalance = coinInfo?.userData?.amount || 0;

	// Initial data fetch
	useEffect(() => {
		if (!initDataRaw) return;
		const fetchData = async () => {
			try {
				const [inf, hist] = await Promise.all([
					ExchangeApi.info(initDataRaw),
					ExchangeApi.history(initDataRaw)
				]);
				setInfo(inf);
				setHistory(hist);
			} catch (e) {
				console.error("Failed to fetch exchange data", e);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [initDataRaw]);

	const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
		setFeedback({ msg, type });
		setTimeout(() => setFeedback(null), 3000);
	};

	const tokenAmount = info && amountInput ? (parseInt(amountInput) / info.config.exchange_rate) : 0;

	const handleExchange = async () => {
		if (!initDataRaw) return;

		if (!isConnected || !address) {
			showFeedback("Please connect wallet first", 'error');
			open();
			return;
		}

		const amount = parseInt(amountInput);
		if (isNaN(amount) || amount <= 0) {
			showFeedback("Invalid amount", 'error');
			return;
		}

		// Validation 1: Check Point Balance
		if (amount > userPointBalance) {
			showFeedback(`Insufficient ${info?.config?.point_name || "Points"}`, 'error');
			return;
		}

		// Validation 2: Check Daily Limit
		// info.user_remaining is the remaining Token quota
		if (tokenAmount > (info?.user_remaining || 0)) {
			showFeedback("Exceeds today's exchange limit", 'error');
			return;
		}

		setSubmitting(true);
		setFeedback(null);
		try {
			await ExchangeApi.doExchange(initDataRaw, amount, address);
			showFeedback("Exchange Successful!", 'success');
			setAmountInput("");
			// Refresh history and info
			const [inf, hist] = await Promise.all([
				ExchangeApi.info(initDataRaw),
				ExchangeApi.history(initDataRaw)
			]);
			setInfo(inf);
			setHistory(hist);
		} catch (e: any) {
			showFeedback(e?.toString() || "Exchange Failed", 'error');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>;
	if (!info) return <div className="w-full h-full flex items-center justify-center text-white">Error loading info</div>;

	return (
		<div className="w-full h-full flex flex-col items-center bg-crypto-bg relative overflow-y-auto pb-20">
			<div className="w-full">
				<Header />
			</div>

			<div className="w-full px-4 pt-4 flex flex-col gap-6">
				{/* Exchange Form */}
				<div className="bg-crypto-card/90 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
					<h2 className="text-xl font-bold text-white">Exchange {info.config.token_name}</h2>

					<div className="flex flex-col gap-1">
						<label className="text-crypto-muted text-sm">Amount </label>
						<div className="relative">
							<input
								type="number"
								value={amountInput}
								onChange={(e) => setAmountInput(e.target.value)}
								className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 pl-10 text-white font-mono text-lg focus:border-crypto-cyan outline-none"
								placeholder="0"
							/>
							<img src={XPIcon} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" alt="XP" />
						</div>
						<div className="flex justify-between text-xs text-crypto-muted px-1">
							<span>Rate: {info.config.exchange_rate} Points = 1 Token</span>
							<span className={userPointBalance < (parseInt(amountInput) || 0) ? "text-red-400" : ""}>
								Balance: {userPointBalance.toLocaleString()} {info.config.point_name}
							</span>
						</div>
					</div>

					<div className="flex justify-center">
						<div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
							<ChevronRight className="rotate-90 text-crypto-muted" />
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-crypto-muted text-sm">Receive ({info.config.token_name})</label>
						<div className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 flex items-center gap-2">
							<img src={HHAIcon} className="w-6 h-6" alt="Token" />
							<span className="text-crypto-cyan font-mono text-xl">{tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
						</div>
						<div className="flex justify-end text-xs text-crypto-muted px-1">
							<span className={tokenAmount > (info.user_remaining || 0) ? "text-red-400" : ""}>
								Today's Limit: {info.user_remaining.toLocaleString()} Available
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-crypto-muted text-sm">Wallet Address</label>
						{isConnected && address ? (
							<div className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm truncate">
								{address}
							</div>
						) : (
							<CryptoButton
								onClick={() => open()}
								className="w-full py-3 text-sm"
							>
								Connect Wallet
							</CryptoButton>
						)}
					</div>

					<CryptoButton
						fullWidth
						className="mt-2"
						onClick={handleExchange}
						loading={submitting}
						disabled={!amountInput || parseFloat(amountInput) <= 0}
					>
						Confirm Exchange
					</CryptoButton>

					{feedback && (
						<div className={`text-sm text-center font-medium ${feedback.type === 'error' ? 'text-red-500' : 'text-green-400'}`}>
							{feedback.msg}
						</div>
					)}
				</div>

				{/* History Section */}
				<div className="flex flex-col gap-3">
					<h3 className="text-lg font-bold text-white px-1">Exchange History</h3>
					<div className="flex flex-col gap-2 pb-10">
						{history.length === 0 ? (
							<div className="text-center text-crypto-muted py-8 text-sm">No history records</div>
						) : (
							history.map((item) => (
								<div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-2">
											<span className="text-white font-bold">{item.token_amount} {info.config.token_name}</span>
											<span className={`text-xs px-2 py-0.5 rounded-full border ${item.status === 1 ? 'border-green-500/30 text-green-400 bg-green-500/10' :
												item.status === 2 ? 'border-red-500/30 text-red-400 bg-red-500/10' :
													'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
												}`}>
												{item.status === 1 ? 'Success' : item.status === 2 ? 'Failed' : 'Pending'}
											</span>
										</div>
										<div className="w-full flex items-center justify-between gap-4 text-xs text-crypto-muted font-mono font-bold">
											<span>To: {item.wallet_addr ? `${item.wallet_addr.slice(0, 6)}...${item.wallet_addr.slice(-6)}` : '-'}</span>
											{item.tx_hash && (
												<span>
													Tx: <a
														href={`https://${getEnv() === Env.Prod ? "" : "testnet."}bscscan.com/tx/${item.tx_hash}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-crypto-cyan underline"
													>
														{item.tx_hash.slice(0, 6)}...{item.tx_hash.slice(-6)}
													</a>
												</span>
											)}
										</div>
										<span className="text-xs text-crypto-muted">{new Date(item.create_time * 1000).toLocaleString()}</span>
									</div>
									<div className="flex flex-col items-end gap-1">
										<span className="text-crypto-muted text-sm">-{item.amount} XP</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
