import { CryptoButton } from './CryptoButton';
import { FC } from 'react';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedPoolCardProps {
	id: string;
	name: string;
	ticker: string;
	chain: string;
	price: number;
	logoUrl?: string; // Optional, placeholder used if missing
	raised: number;
	target: number;
	participants: number;
}

export const FeaturedPoolCard: FC<FeaturedPoolCardProps> = ({ id, name, ticker, chain, price, raised, target, participants }) => {
	const percentage = (raised / target) * 100;
	const navigate = useNavigate();

	const handleJoin = () => {
		navigate(`/game-center/launchpad/pool/${id}`);
	};

	return (
		<div onClick={handleJoin} className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-crypto-cyan/30 to-crypto-purple/30 hover:from-crypto-cyan/60 hover:to-crypto-purple/60 transition-all duration-300 cursor-pointer">
			<div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/10 to-crypto-purple/10 blur-xl opacity-50" />

			<div className="relative bg-crypto-card/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-crypto-bg shrink-0">
						{/* Placeholder Logo if no URL */}
						{ticker[0]}
					</div>
					<div>
						<h3 className="text-crypto-text text-lg font-bold">{name}</h3>
						<div className="flex items-center gap-2 text-sm">
							<span className="text-crypto-muted font-medium">{ticker}</span>
							<span className="w-1 h-1 rounded-full bg-white/20" />
							<span className="text-crypto-cyan font-bold">{chain}</span>
							<span className="w-1 h-1 rounded-full bg-white/20" />
							<span className="text-white font-medium">${price}</span>
						</div>
					</div>
					<div className="ml-auto px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 animate-pulse">
						LIVE
					</div>
				</div>

				{/* Stats */}
				{/* Stats */}
				<div className="space-y-3">
					<div className="flex justify-between text-sm">
						<div>
							<span className="text-crypto-muted">Raised: </span>
							<span className="text-white font-bold">${raised.toLocaleString()}</span>
							<span className="text-crypto-muted"> / ${target.toLocaleString()}</span>
						</div>
						<div className="text-crypto-cyan font-medium">
							{participants.toLocaleString()} <span className="text-crypto-muted text-xs">Participants</span>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex-1">
							<ProgressBar progress={percentage} />
						</div>
						<div className="text-white font-bold text-sm">{percentage.toFixed(0)}%</div>
					</div>
				</div>

				{/* Action */}
				<CryptoButton fullWidth icon={<ChevronRight size={18} />} className="mt-6" onClick={(e) => {
					e.stopPropagation();
					handleJoin();
				}}>
					Join Pool
				</CryptoButton>
			</div>
		</div>
	);
};
