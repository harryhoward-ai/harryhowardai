import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ALL_POOLS } from '../data/pools';
import { CryptoButton } from '../components/CryptoButton';
import { ProgressBar } from '../components/ProgressBar';
import { Wallet, Globe, Twitter, Send } from 'lucide-react';

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

	const percentage = pool.target ? ((pool.raised || 0) / pool.target) * 100 : 0;

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

				{/* Socials / Links (Mock) */}
				<div className="flex items-center justify-center gap-6 text-crypto-muted">
					<Globe size={24} className="hover:text-crypto-cyan transition-colors cursor-pointer" />
					<Twitter size={24} className="hover:text-crypto-cyan transition-colors cursor-pointer" />
					<Send size={24} className="hover:text-crypto-cyan transition-colors cursor-pointer" />
				</div>

				{/* Description (Mock) */}
				<div className="bg-crypto-card/50 rounded-2xl p-5 border border-white/5 text-sm leading-relaxed text-crypto-muted">
					<p>
						{pool.name} is a revolutionary protocol on {pool.chain} designed to empower the next generation of DeFi users.
						Join the exclusive launchpad sale to secure your allocation early.
					</p>
				</div>

				{/* Progress Section */}
				<div className="bg-crypto-card rounded-2xl p-6 border border-white/5 shadow-lg">
					<div className="flex justify-between items-end mb-4">
						<div className="text-crypto-muted text-sm font-medium">Progress</div>
						<div className="text-right">
							<div className="text-2xl font-bold text-white">{(percentage).toFixed(1)}%</div>
							<div className="text-xs text-crypto-muted">
								${pool.raised?.toLocaleString()} / ${pool.target?.toLocaleString()}
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
						<div className="text-crypto-muted text-xs mb-1">Access</div>
						<div className="text-white font-bold">Public</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Min Allocation</div>
						<div className="text-white font-bold">$100</div>
					</div>
					<div className="bg-crypto-card/50 rounded-xl p-4 border border-white/5">
						<div className="text-crypto-muted text-xs mb-1">Max Allocation</div>
						<div className="text-white font-bold">$2,000</div>
					</div>
				</div>

				{/* Join Action */}
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
			</div>
		</div>
	);
};
