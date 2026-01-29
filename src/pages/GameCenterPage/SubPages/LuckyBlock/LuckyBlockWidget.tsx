import { initData, useSignal } from '@telegram-apps/sdk-react';
import { SquadGameApi } from '@/utils/Api';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons - reusing existing asset pattern or placeholders if specific ones aren't available yet
import { ChevronRight } from 'lucide-react';
import { CryptoButton } from '@/pages/Launchpad/components/CryptoButton';
import { LuckyBlockStats } from './LuckyBlockStats';

export const LuckyBlockWidget: FC = () => {
	const navigate = useNavigate();
	const [timeLeft, setTimeLeft] = useState(0);
	const [isLocked, setIsLocked] = useState(false);

	// Data State
	const [roundInfo, setRoundInfo] = useState<any>(null); // Use SquadRoundInfo type if available

	const initDataRaw = useSignal(initData.raw);
	const tgToken = initDataRaw || "";

	// Calculate time remaining and poll data
	useEffect(() => {
		const updateTimer = () => {
			const now = new Date();
			const minutes = now.getMinutes();

			// Game locks at minute 58
			const locked = minutes >= 58;
			setIsLocked(locked);

			let target = new Date(now);
			if (locked) {
				target.setHours(now.getHours() + 1, 0, 0, 0);
			} else {
				target.setMinutes(58, 0, 0);
			}

			const diff = Math.floor((target.getTime() - now.getTime()) / 1000);
			setTimeLeft(diff > 0 ? diff : 0);
		};

		const fetchData = async () => {
			if (tgToken) {
				try {
					const data = await SquadGameApi.getRound(tgToken);
					setRoundInfo(data);
				} catch (error) {
					console.error("Failed to fetch widget round info:", error);
				}
			}
		};

		updateTimer();
		fetchData();

		const timerInterval = setInterval(updateTimer, 1000);
		const dataInterval = setInterval(fetchData, 10000); // Poll every 10s

		return () => {
			clearInterval(timerInterval);
			clearInterval(dataInterval);
		};
	}, [tgToken]);


	return (
		<div className="w-full relative group rounded-2xl p-[1px] transition-all duration-300 bg-gradient-to-br from-crypto-cyan/30 to-crypto-purple/30 hover:from-crypto-cyan/60 hover:to-crypto-purple/60">
			<div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/10 to-crypto-purple/10 blur-xl opacity-50" />

			<div className="relative bg-crypto-card/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl">
				<div className="mb-4">
					<div className="flex items-center justify-between mb-1">
						<h3 className="text-crypto-text text-lg font-bold flex items-center gap-2">
							🎰 Squad Game
						</h3>
						<div className={`px-2 py-0.5 rounded-md text-xs font-bold animate-pulse ${isLocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
							{isLocked ? 'LOCKED' : 'LIVE'}
						</div>
					</div>
					<p className="text-xs text-crypto-muted leading-tight">
						Predict the last digit of the block hash at the end of the hour.
					</p>
				</div>

				{/* Factions Vertical Progress */}
				<LuckyBlockStats className="mb-4" pools={roundInfo?.faction_pools} />

				<div className="flex items-center justify-between gap-3">
					<div className="flex-1 bg-black/20 rounded-lg px-3 py-2 border border-white/5 flex flex-col justify-center">
						<div className="flex items-center justify-between">
							<span className="text-[10px] text-crypto-muted">{isLocked ? 'Revealing In:' : 'Betting Closes In:'}</span>
							<span className={`font-mono text-sm font-bold ${isLocked ? 'text-red-400' : 'text-crypto-cyan'}`}>
								{Math.floor(timeLeft / 60)}m {timeLeft % 60}s
							</span>
						</div>
					</div>

					<CryptoButton
						// variant="secondary" 
						icon={<ChevronRight size={18} />}
						onClick={() => navigate('/game-center/token/lucky-block')}
						className="flex-1"
					// disabled={isLocked} // Button enabled per request
					>
						{isLocked ? 'Wait Reveal' : 'Place Bet'}
					</CryptoButton>
				</div>
			</div>
		</div>
	);
};
