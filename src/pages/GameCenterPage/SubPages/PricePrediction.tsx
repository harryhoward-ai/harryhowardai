
import { CountDown } from "@/components/CountDown/CountDown";
import { PricePredictConfig, PricePredictData, PricePredictStatus } from "@/constats";
import XPIcon from "@/icons/xp-icon.svg";
import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { Header } from "@/pages/Launchpad/components/Header";
import { MarketsApi, PricePredictApi } from "@/utils/Api";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { FC, useEffect, useRef, useState } from "react";
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';

export const PricePrediction: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [_1, _2, updateCoins, _4] = useDashFunCoins();

	const [config, setConfig] = useState<PricePredictConfig | null>(null);
	const [info, setInfo] = useState<PricePredictData | null>(null);
	const [marketPrice, setMarketPrice] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Form State
	const [selectedAmount, setSelectedAmount] = useState<number>(0);
	const [priceInput, setPriceInput] = useState<string>("");

	// Countdown State
	const [timeLeft, setTimeLeft] = useState(0);
	const [timeTitle, setTimeTitle] = useState("Loading...");
	const [isBettingPhase, setIsBettingPhase] = useState(false);

	// Fetch Config and Info
	const initPage = async (isPolling = false) => {
		if (!isPolling) setLoading(true);
		try {
			const [cfg, inf] = await Promise.all([
				PricePredictApi.config(initDataRaw || ""),
				PricePredictApi.info(initDataRaw || "").catch(() => null)
			]);
			setConfig(cfg);
			setInfo(inf);

			if (inf && inf.status !== PricePredictStatus.Unsubmitted) {
				// Pre-fill amount if already bet (Pending/Revealed/Claimed)
				// Only set if not polling or if we want to force sync? 
				// Better not to override user selection if they are interacting?
				// But info.bet_amount is fixed if confirmed.
				if (!isPolling) {
					setSelectedAmount(inf.bet_amount);
					setPriceInput(inf.predict_price.toFixed(2));
				}
			} else {
				// No active bet or Unsubmitted: Default select first amount
				if (!isPolling && cfg && cfg.bet_amounts.length > 0) {
					setSelectedAmount(cfg.bet_amounts[0]);
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			if (!isPolling) setLoading(false);
		}
	};

	useEffect(() => {
		initPage();
		const interval = setInterval(() => initPage(true), 10000);
		return () => clearInterval(interval);
	}, []);

	// Fetch Market Price Polling
	useEffect(() => {
		if (!config || !initDataRaw) return;

		const fetchPrice = async () => {
			try {
				if (config.symbol) {
					const price = await MarketsApi.price(initDataRaw, config.symbol);
					setMarketPrice(price);
				}
			} catch (e) {
				console.error("Failed to fetch market price", e);
			}
		};

		fetchPrice();
		const interval = setInterval(fetchPrice, 10000); // 10s poll
		return () => clearInterval(interval);
	}, [config, initDataRaw]);

	// Auto-fill price input with market price if empty and no prediction
	const initializedPriceRef = useRef(false);
	useEffect(() => {
		const isUnsubmitted = !info || info.status === PricePredictStatus.Unsubmitted;
		if (!loading && isUnsubmitted && marketPrice > 0 && !initializedPriceRef.current) {
			setPriceInput(marketPrice.toFixed(2));
			initializedPriceRef.current = true;
		}
	}, [loading, info, marketPrice]);

	// Calculate Countdown
	useEffect(() => {
		if (!config) return;

		const calculateTime = () => {
			const now = Math.floor(Date.now() / 1000);
			let target = 0;
			let title = "";

			if (now < config.bet_start_time) {
				title = "Betting Starts In";
				target = config.bet_start_time;
				setIsBettingPhase(false);
			} else if (now < config.bet_end_time) {
				title = "Betting Ends In";
				target = config.bet_end_time;
				setIsBettingPhase(true);
			} else if (now < config.reveal_time) {
				title = "Results Reveal In";
				target = config.reveal_time;
				setIsBettingPhase(false);
			} else {
				// Round over
				title = "Round Ended";
				target = 0;
				setIsBettingPhase(false);
			}

			setTimeTitle(title);
			if (target > 0) {
				setTimeLeft(Math.max(0, target - now));
			} else {
				setTimeLeft(0);
			}
		};

		calculateTime();
		// Update every second to keep sync, though CountDown component handles tick,
		// we need to handle phase changes.
		// Actually CountDown handles the tick of 'remaining'. 
		// We just need to set the initial 'remaining' and 'title'.
		// If phase changes, we need to update.
		// Let's use an interval to check phase changes?
		// Or just depend on calculated 'remaining' passed to CountDown? 
		// CountDown decrements. If we change 'remaining', it resets?
		// Yes, CountDown has useEffect([remaining]).

		// To ensure smooth transitions, maybe we check phase every second too?
		const interval = setInterval(calculateTime, 1000);
		return () => clearInterval(interval);

	}, [config]);

	// Feedback State
	const [feedback, setFeedback] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

	// Helper to show feedback
	const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
		setFeedback({ msg, type });
		setTimeout(() => setFeedback(null), 3000);
	};

	const handleSubmit = async () => {
		if (!config) return;
		const priceVal = parseFloat(priceInput);
		if (isNaN(priceVal) || priceVal <= 0) {
			showFeedback("Please enter a valid price", 'error');
			return;
		}

		setSubmitting(true);
		setFeedback(null);
		try {
			// If updating (Pending), we MUST use the originally selected bet amount.
			// If Unsubmitted (new bet), use the currently selected amount.
			const isUnsubmitted = !info || info.status === PricePredictStatus.Unsubmitted;
			const betAmt = isUnsubmitted ? selectedAmount : info.bet_amount;

			const newRecord = await PricePredictApi.bet(initDataRaw || "", priceVal, betAmt);
			setInfo(newRecord);
			showFeedback(info ? "Prediction Updated!" : "Bet Placed!", 'success');
		} catch (e: any) {
			showFeedback(e?.toString() || "Failed to submit", 'error');
		} finally {
			setSubmitting(false);
			updateCoins?.(["DashFun"]);
		}
	};

	const handleClaim = async () => {
		setSubmitting(true);
		setFeedback(null);
		try {
			const newRecord = await PricePredictApi.claim(initDataRaw || "");
			setInfo(newRecord);
			showFeedback("Reward Claimed!", 'success');
		} catch (e: any) {
			showFeedback(e?.toString() || "Failed to claim", 'error');
		} finally {
			setSubmitting(false);
			updateCoins?.(["DashFun"]);
		}
	}

	if (loading) return <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>;
	if (!config) return <div className="w-full h-full flex items-center justify-center text-white">Config Error</div>;

	const isPending = info?.status === PricePredictStatus.Pending;
	const isRevealed = info?.status === PricePredictStatus.Revealed;
	const isClaimed = info?.status === PricePredictStatus.Claimed;

	return (
		<div className="w-full h-full flex flex-col items-center bg-crypto-bg relative overflow-y-auto pb-20">
			{/* Header */}
			<div className="w-full">
				<Header />
			</div>

			<div className="w-full px-4 pt-4 flex flex-col items-center gap-6 z-10">
				{/* Market Price Display */}
				<div className="flex flex-col items-center">
					<span className="text-crypto-muted text-sm uppercase tracking-widest">Current {config.symbol} Price</span>
					<span className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
						${marketPrice.toFixed(2)}
					</span>
				</div>

				{/* Pool Info */}
				<div className="w-full grid grid-cols-2 gap-4">
					<div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
						<span className="text-crypto-muted text-xs">Total Pool</span>
						<div className="flex items-center gap-1">
							<img src={XPIcon} className="w-5 h-5" alt="XP" />
							<span className="text-crypto-cyan font-bold text-lg">{config.pool_info.total_pool}</span>
						</div>
					</div>
					<div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
						<span className="text-crypto-muted text-xs">Participants</span>
						<span className="text-white font-bold text-lg">{config.pool_info.user_count}</span>
					</div>
				</div>

				{/* Countdown */}
				<CountDown remaining={timeLeft} title={timeTitle} className="w-full" />

				{/* Main Action Area */}
				<div className="w-full bg-crypto-card/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-5">

					{/* Status: Claimed/Revealed Result */}
					{(isRevealed || isClaimed) && (
						<div className="flex flex-col items-center gap-2">
							<span className="text-2xl font-bold text-crypto-cyan">{isClaimed ? "Reward Claimed" : "Result Revealed"}</span>

							<div className="flex flex-col items-center gap-1 my-2 p-3 bg-white/5 rounded-xl w-full">
								<div className="flex justify-between w-full text-sm">
									<span className="text-crypto-muted">Real Price</span>
									<span className="text-white font-mono">${info.real_price?.toFixed(2) || "0.00"}</span>
								</div>
								<div className="flex justify-between w-full text-sm">
									<span className="text-crypto-muted">Your Prediction</span>
									<span className="text-white font-mono">${info.predict_price.toFixed(2)}</span>
								</div>
								<div className="flex justify-between w-full text-sm">
									<span className="text-crypto-muted">Bet Amount</span>
									<div className="flex items-center gap-1">
										<img src={XPIcon} className="w-4 h-4" alt="XP" />
										<span className="text-white font-mono">{info.bet_amount}</span>
									</div>
								</div>
								<div className="w-full h-[1px] bg-white/10 my-1"></div>
								<div className="flex justify-between w-full font-bold">
									<span className="text-crypto-cyan">Reward</span>
									<div className="flex items-center gap-1">
										<img src={XPIcon} className="w-5 h-5" alt="XP" />
										<span className="text-crypto-cyan text-lg">{info.reward_points}</span>
									</div>
								</div>
							</div>
							{isRevealed && (
								<CryptoButton onClick={handleClaim} loading={submitting} className="mt-4 w-full">
									Claim Reward
								</CryptoButton>
							)}
							{/* Feedback for Claim */}
							{feedback && (
								<div className={`text-sm text-center mt-2 ${feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
									{feedback.msg}
								</div>
							)}
						</div>
					)}

					{/* Betting Form */}
					{(!info || info.status === PricePredictStatus.Unsubmitted || isPending) && (
						<>
							<div className="flex flex-col gap-2">
								<label className="text-crypto-muted text-sm">Select Bet Amount</label>
								<div className="grid grid-cols-4 gap-2">
									{config.bet_amounts.map((amt) => {
										const isSelected = selectedAmount === amt;
										// If pending (already bet), lock the amount selection to the one bet
										const isLocked = isPending && info.bet_amount !== amt;

										return (
											<button
												key={amt}
												disabled={isPending}
												onClick={() => setSelectedAmount(amt)}
												className={`
                                                    py-2 rounded-lg font-bold text-sm transition-all border flex items-center justify-center gap-1
                                                    ${isSelected
														? "bg-crypto-cyan text-black border-crypto-cyan shadow-[0_0_10px_rgba(0,243,255,0.4)]"
														: "bg-white/5 text-white border-white/10 hover:bg-white/10"}
                                                    ${isLocked ? "opacity-30 cursor-not-allowed" : ""}
                                                `}
											>
												<img src={XPIcon} className="w-4 h-4" alt="XP" />
												{amt}
											</button>
										)
									})}
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-crypto-muted text-sm">Predict Price (USDT)</label>
								<div className="relative">
									<input
										type="number"
										step="0.01"
										disabled={!isBettingPhase}
										value={priceInput}
										onChange={(e) => {
											// Enforce 2 decimal places if needed, but standard input allows typing
											setPriceInput(e.target.value)
										}}
										className={`w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-lg focus:border-crypto-cyan outline-none ${!isBettingPhase ? "opacity-50 cursor-not-allowed" : ""}`}
										placeholder="0.00"
									/>
								</div>
								<p className="text-[10px] text-crypto-muted leading-tight">
									* Based on {config.symbol} price at reveal time ({new Date(config.reveal_time * 1000).toLocaleString()}). Closer predictions earn higher rewards.
								</p>
							</div>

							<CryptoButton
								onClick={handleSubmit}
								loading={submitting}
								disabled={!isBettingPhase || !priceInput || selectedAmount <= 0}
								className="w-full mt-2"
							>
								{isBettingPhase
									? (isPending ? "Update Prediction" : "Submit Prediction")
									: (isPending ? "Waiting for Reveal" : "Round Locked")}
							</CryptoButton>

							{/* Feedback Message */}
							{feedback && (
								<div className={`text-sm text-center font-medium ${feedback.type === 'error' ? 'text-red-500' : 'text-green-400'}`}>
									{feedback.msg}
								</div>
							)}

							{isPending && (
								<p className="text-xs text-center text-crypto-muted mt-0">
									You can update your prediction price before betting ends.
									Bet amount cannot be changed.
								</p>
							)}
						</>
					)}

				</div>

				{/* Rules Info */}
				{/* <div className="text-xs text-crypto-muted text-center px-4">
					Max Diff Limit: {config.max_diff_limit}% • Consolation Rate: {config.consolation_rate * 100}%
				</div> */}
			</div>
		</div>
	);
};
