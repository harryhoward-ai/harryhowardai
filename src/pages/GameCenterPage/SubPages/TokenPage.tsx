import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { ExchangeApi, ExchangeInfo } from "@/utils/Api";
import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { ProgressBar } from "@/pages/Launchpad/components/ProgressBar";
import { Header } from "@/pages/Launchpad/components/Header";
import { ChevronRight } from "lucide-react";
import XPIcon from "@/icons/xp-icon.svg";
import HHAIcon from "@/icons/howardai-icon.png";

import { CountDown } from "@/components/CountDown/CountDown";
import { LuckyBlockWidget } from "./LuckyBlock/LuckyBlockWidget";

export const TokenPage: FC = () => {
	const navigate = useNavigate();
	const initDataRaw = useSignal(initData.raw);
	const [info, setInfo] = useState<ExchangeInfo | null>(null);
	const [loading, setLoading] = useState(true);

	const [timeLeft, setTimeLeft] = useState(0);
	const [timeTitle, setTimeTitle] = useState("");

	// Reset Countdown
	const [resetCountdown, setResetCountdown] = useState("");

	useEffect(() => {
		const updateResetTime = () => {
			const now = new Date();
			const nextMidnight = new Date();
			nextMidnight.setUTCHours(24, 0, 0, 0);
			const diff = nextMidnight.getTime() - now.getTime();

			if (diff > 0) {
				const h = Math.floor(diff / (1000 * 60 * 60));
				const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				const s = Math.floor((diff % (1000 * 60)) / 1000);
				setResetCountdown(`${h}h ${m}m ${s}s`);
			} else {
				setResetCountdown("0h 0m 0s");
			}
		};

		updateResetTime();
		const interval = setInterval(updateResetTime, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const fetchInfo = async () => {
			if (!initDataRaw) return;
			try {
				const res = await ExchangeApi.info(initDataRaw);
				setInfo(res);
			} catch (e) {
				console.error("Failed to fetch exchange info", e);
			} finally {
				setLoading(false);
			}
		};
		fetchInfo();
		const interval = setInterval(fetchInfo, 30000);
		return () => clearInterval(interval);
	}, [initDataRaw]);

	useEffect(() => {
		if (!info) return;
		const calculateTime = () => {
			const now = Math.floor(Date.now() / 1000);
			let target = 0;
			let title = "";

			const startTime = info.start_time_unix;
			const endTime = info.start_time_unix + (info.config.duration_days * 86400);

			if (info.status === "NotStarted") {
				// Show if within 24 hours
				if (startTime - now <= 86400 && startTime > now) {
					title = "Starts In";
					target = startTime;
				}
			} else if (info.status === "Active") {
				title = "Ends In";
				target = endTime;
			}

			if (target > 0 && target > now) {
				setTimeTitle(title);
				setTimeLeft(target - now);
			} else {
				setTimeLeft(0);
			}
		}

		calculateTime();
		const interval = setInterval(calculateTime, 1000);
		return () => clearInterval(interval);
	}, [info]);

	const handleExchange = () => {
		navigate("/game-center/token/exchange");
	};

	if (loading) return <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>;
	if (!info) return <div className="w-full h-full flex items-center justify-center text-white">Error loading info</div>;

	const isEnded = info.status === "Ended";
	const isNotStarted = info.status === "NotStarted";
	const isActive = info.status === "Active";

	// Calculate global progress
	const globalProgress = info.config.daily_global_limit > 0
		? (info.global_used / info.config.daily_global_limit) * 100
		: 0;

	return (
		<div className="w-full h-full flex flex-col items-center bg-crypto-bg relative overflow-y-auto pb-20">
			{/* Header */}
			<div className="w-full">
				<Header />
			</div>

			<div className="w-full px-4 pt-4 flex flex-col items-center gap-6 z-10">

				{/* Lucky Block Widget */}
				<LuckyBlockWidget />

				{/* Exchange Card */}
				<div className={`w-full relative group rounded-2xl p-[1px] transition-all duration-300 ${isEnded ? 'opacity-80 grayscale' : 'bg-gradient-to-br from-crypto-cyan/30 to-crypto-purple/30 hover:from-crypto-cyan/60 hover:to-crypto-purple/60'}`}>
					<div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/10 to-crypto-purple/10 blur-xl opacity-50" />

					<div className="relative bg-crypto-card/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl">
						{/* Card Header */}
						<div className="flex items-center gap-4 mb-6">
							<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-crypto-bg shrink-0 overflow-hidden">
								{/* Placeholder Icon */}
								<img src={HHAIcon} alt="Token" className="w-full h-full object-cover" />
							</div>
							<div>
								<h3 className="text-crypto-text text-lg font-bold">{info.config.token_name} Exchange</h3>
								<div className="flex items-center gap-2 text-sm">
									<span className="text-crypto-muted font-medium flex items-center gap-1">
										Rate:
									</span>
									<span className="text-crypto-cyan font-bold flex items-center gap-1">
										{info.config.exchange_rate} <img src={XPIcon} className="w-4 h-4" alt="Point" />
									</span>
									<span className="text-crypto-muted font-medium flex items-center gap-1">
										= 1 <img src={HHAIcon} className="w-4 h-4" alt="Token" /> {info.config.token_name}
									</span>
								</div>
							</div>
							<div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${isActive ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' : 'bg-white/10 text-white/50 border-white/20'}`}>
								{info.status.toUpperCase()}
							</div>
						</div>

						{/* Countdown */}
						{timeLeft > 0 && (
							<div className="mb-4">
								<CountDown remaining={timeLeft} title={timeTitle} className="w-full" />
							</div>
						)}

						{/* Stats */}
						<div className="space-y-4">
							{/* Global Limit */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<div>
										<span className="text-crypto-muted">Today's Global Limit</span>
									</div>
									<div className="text-white font-medium flex items-center gap-1">
										{info.global_used.toLocaleString()} <span className="text-crypto-muted">/ {info.config.daily_global_limit.toLocaleString()}</span>
										<img src={HHAIcon} className="w-3.5 h-3.5" alt="Token" /> HHA
									</div>
								</div>

								{!isEnded && (
									<>
										<div className="flex items-center gap-3">
											<div className="flex-1">
												<ProgressBar progress={globalProgress} />
											</div>
											<div className="text-white font-bold text-sm">{globalProgress.toFixed(0)}%</div>
										</div>
										{isActive && (
											<div className="text-right text-[10px] text-crypto-muted">
												Resets in: <span className="text-crypto-cyan font-mono">{resetCountdown}</span>
											</div>
										)}
									</>
								)}
							</div>

							{/* User Limit */}
							<div className="p-3 bg-white/5 rounded-xl flex justify-between items-center text-sm">
								<span className="text-crypto-muted">Your Today's Usage</span>
								<div className="text-right">
									<div className="text-white font-bold flex items-center justify-end gap-1">
										{info.user_used.toLocaleString()} / {info.config.daily_user_limit.toLocaleString()}
										<img src={HHAIcon} className="w-3.5 h-3.5" alt="Token" /> HHA
									</div>
									<div className="text-[10px] text-crypto-muted">Remaining: {info.user_remaining.toLocaleString()}</div>
								</div>
							</div>
						</div>

						{/* Action */}
						{!isEnded && (
							<CryptoButton
								fullWidth
								icon={isNotStarted ? undefined : <ChevronRight size={18} />}
								className="mt-6"
								onClick={handleExchange}
								disabled={isNotStarted}
							>
								{isNotStarted ? "Not Started" : "Exchange"}
							</CryptoButton>
						)}
					</div>
				</div>

			</div>
		</div>
	);
};
