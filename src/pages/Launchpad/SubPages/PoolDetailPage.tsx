import { CountDown } from '@/components/CountDown/CountDown';
import { Globe, Send, Wallet, X } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CryptoButton } from '../components/CryptoButton';
import { ProgressBar } from '../components/ProgressBar';
import { ALL_POOLS } from '../data/pools';

export const PoolDetailPage: FC = () => {
	const { id } = useParams<{ id: string }>();
	const pool = useMemo(() => ALL_POOLS.find(p => p.id === id), [id]);
	const [amount, setAmount] = useState<string>('');

	if (!pool) {
		return (
			<div className="min-h-screen bg-crypto-bg flex items-center justify-center text-crypto-text">
				Pool not found
			</div>
		);
	}

	const now = Date.now();
	const isStarted = now >= pool.startTime;
	const isEnded = pool.endTime ? now > pool.endTime : false;

	let progressFactor = 0;
	if (isStarted) {
		if (isEnded) {
			progressFactor = 1;
		} else if (pool.endTime) {
			const totalDuration = pool.endTime - pool.startTime;
			const elapsed = now - pool.startTime;
			progressFactor = Math.min(Math.max(elapsed / totalDuration, 0), 1);
		}
	}

	const targetRaised = pool.target || 0;
	const targetParticipants = pool.targetParticipants || 0;

	const displayRaised = targetRaised * progressFactor;
	const displayParticipants = Math.floor(targetParticipants * progressFactor);
	const percentage = progressFactor * 100;

	return (
		<div className="min-h-screen bg-crypto-bg text-crypto-text pb-24 font-sans">
			{/* Decorative Background */}
			<div className="fixed top-0 left-0 w-full h-[300px] bg-crypto-cyan/10 blur-[100px] pointer-events-none" />

			<div className="relative z-10 px-5 pt-8 space-y-8">
				{/* Pool Header */}
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
						<span className="text-3xl font-bold text-crypto-bg">{pool.ticker[0]}</span>
					</div>
					<div>
						<h1 className="text-3xl font-bold text-white mb-2">{pool.name}</h1>
						<div className="flex items-center justify-center gap-3">
							<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-crypto-muted">
								${pool.ticker}
							</span>
							<span className="px-3 py-1 rounded-full bg-crypto-cyan/10 border border-crypto-cyan/20 text-sm font-bold text-crypto-cyan">
								{pool.chain}
							</span>
						</div>
					</div>
				</div>

				{/* Socials / Links */}
				<div className="flex items-center justify-center gap-6 text-crypto-muted">
					{pool.website && (
						<a href={pool.website} target="_blank" rel="noopener noreferrer" className="hover:text-crypto-cyan transition-colors">
							<Globe size={24} />
						</a>
					)}
					{pool.x && (
						<a href={pool.x} target="_blank" rel="noopener noreferrer" className="hover:text-crypto-cyan transition-colors">
							<X size={24} />
						</a>
					)}
					{pool.telegram && (
						<a href={pool.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-crypto-cyan transition-colors">
							<Send size={24} />
						</a>
					)}
				</div>

				{/* Description */}
				<div className="bg-crypto-card/50 rounded-2xl p-5 border border-white/5 text-sm leading-relaxed text-crypto-muted">
					<p>
						{pool.description || `${pool.name} is a revolutionary protocol on ${pool.chain} designed to empower the next generation of DeFi users. Join the exclusive launchpad sale to secure your allocation early.`}
					</p>
				</div>

				{/* Countdown */}
				{(() => {
					const now = Date.now();
					const timeToStart = pool.startTime - now;
					const timeToEnd = (pool.endTime || 0) - now;

					if (timeToStart > 0) {
						// Not started yet
						if (timeToStart < 24 * 60 * 60 * 1000) {
							return (
								<div className="mb-8">
									<CountDown
										remaining={Math.floor(timeToStart / 1000)}
										title="Starts In"
										className="mx-0 w-full"
									/>
								</div>
							);
						}
					} else if (pool.endTime && timeToEnd > 0) {
						// Started and has end time
						return (
							<div className="mb-8">
								<CountDown
									remaining={Math.floor(timeToEnd / 1000)}
									title="Ends In"
									className="mx-0 w-full"
								/>
							</div>
						);
					} else if (pool.endTime && timeToEnd <= 0) {
						// Ended
						return (
							<div className="mb-8 text-center p-4 bg-white/5 rounded-xl border border-white/10">
								<div className="text-xl font-bold text-crypto-muted">Pool Ended</div>
							</div>
						);
					}
					return null;
				})()}

				{/* Progress Section */}
				<div className="bg-crypto-card rounded-2xl p-6 border border-white/5 shadow-lg">
					<div className="flex justify-between items-end mb-4">
						<div className="text-crypto-muted text-sm font-medium">Progress</div>
						<div className="text-right">
							<div className="text-2xl font-bold text-white">{(percentage).toFixed(1)}%</div>
							<div className="text-xs text-crypto-muted">
								${displayRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${pool.target?.toLocaleString()}
							</div>
						</div>
					</div>
					<ProgressBar progress={percentage} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Swap Rate</div>
						<div className="text-white font-bold">1 {pool.ticker} = ${pool.price}</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Participants</div>
						<div className="text-white font-bold">{displayParticipants.toLocaleString()}</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Access</div>
						<div className="text-white font-bold">Public</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Min Allocation</div>
						<div className="text-white font-bold">${pool.minAllocation?.toLocaleString() || 'TBA'}</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Max Allocation</div>
						<div className="text-white font-bold">${pool.maxAllocation?.toLocaleString() || 'TBA'}</div>
					</div>
				</div>

				{/* Join Action */}
				{!isEnded && (
					<div className="bg-gradient-to-br from-crypto-cyan/10 to-crypto-purple/10 rounded-2xl p-[1px]">
						<div className="bg-crypto-card rounded-2xl p-5 backdrop-blur-md">
							<div className="flex items-center justify-between mb-4">
								<span className="text-white font-bold text-lg">Join Pool</span>
								<div className="flex items-center gap-1.5 text-xs text-crypto-muted">
									<Wallet size={12} />
									<span>Balance: 0 USDT</span>
								</div>
							</div>

							<div className="relative mb-6">
								<input
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-4 pr-20 text-white font-bold text-xl placeholder:text-white/10 focus:outline-none focus:border-crypto-cyan/50 transition-colors"
								/>
								<div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-crypto-muted">
									USDT
								</div>
							</div>

							<CryptoButton fullWidth>
								Commit USDT
							</CryptoButton>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
