import { FACTIONS } from "@/constats";
import { CryptoButton } from '@/pages/Launchpad/components/CryptoButton';
import { Env, getEnv, SquadBetInfo, SquadRoundInfo } from "@/utils/Api";
import HHAIcon from "@/icons/howardai-icon.png";
import React, { FC } from 'react';

// Use a shared FACTIONS type or import if moved to constants
// For now duplication to decouple, or import if preferred.
// Assuming FACTIONS will be passed or imported. 
// Let's pass FACTIONS as prop or import from a shared file if created.
// To keep it simple without creating many files, I'll copy the structure def here or assume passed.
// Actually, it's better to keep FACTIONS in the main page and pass relevant data or export it.
// Let's export FACTIONS from LuckyBlockPage or a constants file. 
// For this step I will expect FACTIONS to be passed or derived, but since it's static data:

interface SettledRoundViewProps {
	roundInfo: SquadRoundInfo;
	userBet: SquadBetInfo | null;
	betStatus: { type: 'success' | 'error', message: React.ReactNode } | null;
	onClaimReward: (isWin: boolean) => void;
}

export const SettledRoundView: FC<SettledRoundViewProps> = ({
	roundInfo,
	userBet,
	betStatus,
	onClaimReward
}) => {
	return (
		<div className="bg-crypto-card/90 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl animate-fade-in flex flex-col gap-4">
			<h3 className="text-xl font-bold text-center text-white mb-2">Round Settled</h3>

			{/* Settled Block Info */}
			<div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col gap-2 text-xs min-h-[100px] justify-center">
				{roundInfo.settled_block_number === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-4 animate-pulse">
						<div className="w-6 h-6 border-2 border-crypto-cyan border-t-transparent rounded-full animate-spin" />
						<span className="text-crypto-cyan font-bold">Waiting for Settlement...</span>
						<span className="text-[10px] text-crypto-muted">Generating Block Hash</span>
					</div>
				) : (
					<>
						<div className="flex justify-between items-center">
							<span className="text-crypto-muted">Settled Block:</span>
							<a
								href={`https://${getEnv() === Env.Prod ? "" : "testnet."}bscscan.com/block/${roundInfo.settled_block_number}`}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-crypto-cyan underline"
							>
								{roundInfo.settled_block_number}
							</a>
						</div>

						<div className="h-[1px] w-full bg-white/5" />

						<div className="flex justify-between items-center">
							<span className="text-crypto-muted">Settled Time:</span>
							<span className="font-mono text-white text-[10px]">
								{new Date(roundInfo.updated_at * 1000).toLocaleString()}
							</span>
						</div>

						<div className="h-[1px] w-full bg-white/5" />

						<div className="flex justify-between items-center">
							<span className="text-crypto-muted">Settled Hash:</span>
							<a
								href={`https://${getEnv() === Env.Prod ? "" : "testnet."}bscscan.com/block/${roundInfo.settled_block_number}`}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-white underline break-all text-right max-w-[200px]"
							>
								{roundInfo.settled_block_hash?.length > 10 ? (
									<span>
										{roundInfo.settled_block_hash.slice(0, 6)}...{roundInfo.settled_block_hash.slice(-6, -1)}
										<span className="text-yellow-400 font-bold text-lg ml-[1px]">{roundInfo.settled_block_hash.slice(-1)}</span>
									</span>
								) : (
									roundInfo.settled_block_hash
								)}
							</a>
						</div>
					</>
				)}
			</div>

			{/* Winning Faction Highlight */}
			<div className="flex flex-col items-center py-4">
				<p className="text-sm text-crypto-muted mb-2">Winning Faction</p>
				<div className={`text-4xl filter drop-shadow-lg ${FACTIONS[roundInfo.winning_faction]?.color} mb-2`}>
					{FACTIONS[roundInfo.winning_faction]?.icon} {FACTIONS[roundInfo.winning_faction]?.name}
				</div>
				<div className="flex gap-2">
					{FACTIONS[roundInfo.winning_faction]?.numbers.map(n => {
						const winningNum = parseInt(roundInfo.settled_block_hash.slice(-1), 16);
						const isWinner = n === winningNum;
						return (
							<span
								key={n}
								className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center font-mono border shadow-inner transition-all duration-500
									${isWinner
										? 'bg-yellow-400 text-black border-yellow-200 scale-125 shadow-[0_0_10px_#facc15]'
										: 'bg-white/10 text-white border-white/5'
									}`}
							>
								{n.toString(16).toUpperCase()}
							</span>
						);
					})}
				</div>
			</div>

			{/* User Result */}
			{userBet && userBet.round_id === roundInfo.round_id ? (
				<div className={`rounded-xl p-4 border flex flex-col items-center gap-3
                    ${userBet.faction === roundInfo.winning_faction
						? 'bg-green-500/10 border-green-500/30'
						: 'bg-red-500/10 border-red-500/30'}`
				}>
					<div className="flex flex-col items-center">
						<span className="text-xs text-white/70">You Bet</span>
						<span className="font-bold text-white flex items-center gap-1">
							{/* Assuming ethers is not available here easily without import. 
                                Passing formatted amount might be better, but let's assume we handle wei conversion upstream or simple display here. 
                                Actually let's just do a simple division or regex if simple, or import ethers. 
                                Trying to keep imports clean. Let's assume passed prop should handle formatting or just import ethers.
                                I will import ethers for safety. 
                            */}
							{(Number(userBet.amount) / 1e18).toString()} <img src={HHAIcon} className="w-3 h-3" /> on {FACTIONS[userBet.faction]?.name} {FACTIONS[userBet.faction]?.icon}
						</span>
					</div>

					{userBet.faction === roundInfo.winning_faction ? (
						<>
							<div className="text-green-400 font-bold text-lg animate-bounce">🎉 YOU WON! 🎉</div>
							<CryptoButton
								fullWidth
								onClick={() => onClaimReward(true)}
								disabled={userBet.is_claimed}
								className={!userBet.is_claimed ? 'animate-pulse' : ''}
							>
								{userBet.is_claimed ? 'Reward Claimed ✅' : 'Claim Reward 💰'}
							</CryptoButton>
						</>
					) : (
						<>
							<div className="text-red-400 font-bold mb-2">Better luck next time! 😢</div>
							<CryptoButton
								fullWidth
								variant="secondary"
								onClick={() => onClaimReward(false)}
							>
								Next Round 🔄
							</CryptoButton>
						</>
					)}
				</div>
			) : (
				<div className="text-center text-crypto-muted text-sm py-4">
					You didn't verify a bet this round.
				</div>
			)}

			{/* Feedback Message */}
			{betStatus && (
				<div className={`mt-2 p-3 rounded-lg text-xs font-mono break-all border 
                    ${betStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
					{betStatus.type === 'success' ? '✅ ' : '❌ '}
					{betStatus.message}
				</div>
			)}
		</div>
	);
};
