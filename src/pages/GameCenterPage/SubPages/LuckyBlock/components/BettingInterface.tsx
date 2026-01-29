import { FACTIONS } from "@/constats";
import { CryptoButton } from '@/pages/Launchpad/components/CryptoButton';
import { LuckyBlockStats } from '../LuckyBlockStats';
import HHAIcon from "@/icons/howardai-icon.png";
import React, { FC, useMemo } from 'react';

const BET_AMOUNTS = [10, 20, 50, 100, 200, 500];

interface BettingInterfaceProps {
	roundInfo: any; // Type lazily for now, or import shared type
	selectedFaction: string | null;
	setSelectedFaction: (id: string) => void;
	betAmount: number | null;
	setBetAmount: (amount: number) => void;
	isLocked: boolean;
	hasBet: boolean;
	isConnected: boolean;
	onPlaceBet: () => void;
	onConnect: () => void;
	betStatus: { type: 'success' | 'error', message: React.ReactNode } | null;
	isGameActive: boolean;
}

export const BettingInterface: FC<BettingInterfaceProps> = ({
	roundInfo,
	selectedFaction,
	setSelectedFaction,
	betAmount,
	setBetAmount,
	isLocked,
	hasBet,
	isConnected,
	onPlaceBet,
	onConnect,
	betStatus,
	isGameActive
}) => {

	const selectedFactionData = useMemo(() => FACTIONS.find(f => f.id === selectedFaction), [selectedFaction]);

	return (
		<>
			{/* Progress Stats */}
			<LuckyBlockStats className="mb-4" pools={roundInfo?.faction_pools} />

			{/* Faction Selection */}
			<div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${isLocked || hasBet || !isGameActive ? 'opacity-80' : ''}`}>
				{FACTIONS.map((faction) => (
					<button
						key={faction.id}
						onClick={() => isGameActive && !hasBet && setSelectedFaction(faction.id)}
						disabled={isLocked || hasBet || !isGameActive}
						className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 group
                            ${selectedFaction === faction.id
								? `${faction.bg} ${faction.border} scale-[1.02] shadow-[0_0_15px_rgba(0,0,0,0.3)]`
								: `bg-crypto-card/50 border-white/5 ${!hasBet && !isLocked && isGameActive ? `hover:border-white/20 ${faction.hover}` : ''}`
							}
                            ${(hasBet || isLocked || !isGameActive) && selectedFaction !== faction.id ? 'opacity-50 grayscale' : ''}
                        `}
					>
						<div className="flex flex-row items-center gap-2 mb-1">
							<div className="text-3xl filter drop-shadow-lg transform transition-transform group-hover:scale-110">{faction.icon}</div>
							<div className={`font-bold text-3xl leading-none ${faction.color}`}>{faction.name}</div>
						</div>
						<div className="text-[10px] text-white/50 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm mb-1">
							{faction.slogan}
						</div>
						{/* Numbers display */}
						<div className="flex gap-1">
							{faction.numbers.map(n => (
								<span key={n} className="text-xs font-bold w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-white">
									{n.toString(16).toUpperCase()}
								</span>
							))}
						</div>

						{selectedFaction === faction.id && (
							<div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
						)}
					</button>
				))}
			</div>

			{!isGameActive && (
				<div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm font-bold mt-4">
					⛔ GAME IS CURRENTLY INACTIVE
				</div>
			)}

			{isGameActive && isLocked && !hasBet && (
				<div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm font-bold animate-pulse mt-4">
					⚠️ BETTING IS LOCKED FOR THIS ROUND
				</div>
			)}

			{/* Amount Selection */}
			{(selectedFaction || hasBet) && (
				<div className="bg-crypto-card/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl animate-slide-up mt-4">
					<label className="text-sm text-crypto-muted mb-3 block">
						{hasBet ? 'Your Bet Amount' : 'Select Bet Amount'}
					</label>
					<div className="grid grid-cols-3 gap-2 mb-6">
						{BET_AMOUNTS.map((amount) => (
							<button
								key={amount}
								onClick={() => !hasBet && setBetAmount(amount)}
								disabled={hasBet}
								className={`py-2 px-1 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-1
                                    ${betAmount === amount
										? 'bg-white text-black border-white shadow-lg scale-105'
										: `bg-white/5 text-white border-white/10 ${!hasBet ? 'hover:bg-white/10' : 'opacity-50'}`
									}
                                `}
							>
								{amount} <img src={HHAIcon} className="w-4 h-4" alt="HHA" />
							</button>
						))}
					</div>

					{betAmount && (
						<div className="flex flex-col gap-2 mb-3">
							{hasBet && (
								<p className="text-xs text-center text-crypto-muted leading-relaxed">
									You have locked <span className="font-bold text-white">{betAmount} HHA</span> on <span className={`font-bold ${selectedFactionData?.color}`}>{selectedFactionData?.name}</span>. Good luck! 🍀
								</p>
							)}
							<p className="text-xs text-center text-crypto-muted leading-relaxed">
								If the hourly block hash ends in <span className={`font-bold ${selectedFactionData?.color}`}>{selectedFactionData?.numbers.map(n => n.toString(16).toUpperCase()).join(', ')}</span>, you win!
							</p>
						</div>
					)}

					<CryptoButton
						fullWidth
						disabled={isConnected ? (!betAmount || hasBet) : false}
						onClick={() => {
							if (isConnected && !hasBet) {
								onPlaceBet();
							} else {
								onConnect();
							}
						}}
						className={`text-lg py-4 shadow-lg shadow-crypto-primary/20 ${hasBet ? 'opacity-80 cursor-not-allowed' : ''}`}
						icon={(isConnected && !hasBet) ? <img src={HHAIcon} className="w-5 h-5 rounded-full" /> : undefined}
						variant={hasBet ? 'secondary' : 'primary'}
					>
						{isConnected
							? (hasBet ? 'Bet Placed ✅' : 'Place Bet')
							: 'Connect to Bet'
						}
					</CryptoButton>

					{/* Feedback Message */}
					{betStatus && (
						<div className={`mt-3 p-3 rounded-lg text-xs font-mono break-all border 
                            ${betStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
							{betStatus.type === 'success' ? '✅ ' : '❌ '}
							{betStatus.message}
						</div>
					)}
				</div>
			)}
		</>
	);
};
