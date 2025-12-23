import { FC, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useComingData } from '../context/PoolsContext';
import { CountDown } from '@/components/CountDown/CountDown';
import { useNavigate } from 'react-router-dom';

export const PoolList: FC = () => {
	const { data: pools } = useComingData();
	const navigate = useNavigate();
	// Force re-render periodically to check for "24h" boundary crossing? 
	// Not strictly required if we assume page reload, but good practice.
	// For now, simple render.
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 60000); // Check every minute
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="space-y-3">
			{pools.map((pool) => {
				const timeToStart = pool.startTime - now;
				const isStartsSoon = timeToStart > 0 && timeToStart < 24 * 60 * 60 * 1000;

				return (
					<div
						key={pool.id}
						onClick={() => navigate(`/game-center/launchpad/pool/${pool.id}`)}
						className="flex flex-col gap-4 mb-4 p-4 rounded-xl bg-crypto-card/50 border border-white/5 hover:bg-crypto-card transition-colors cursor-pointer group"
					>
						{/* Countdown Integrated (if starting soon) */}
						{isStartsSoon && (
							<div className="w-full mt-2">
								<CountDown
									remaining={Math.floor(timeToStart / 1000)}
									title="Starts In"
									className="mx-0 w-full"
									size="sm"
								/>
							</div>
						)}
						{/* Standard Pool Item Header */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-lg bg-crypto-purple/10 flex items-center justify-center text-crypto-purple">
									<Calendar size={20} />
								</div>
								<div className="flex flex-col">
									<div className="text-white font-bold text-lg leading-tight">
										{pool.name} <span className="text-crypto-muted text-sm font-normal ml-1">({pool.ticker})</span>
									</div>
									<div className="flex items-center text-xs text-crypto-muted mt-1 font-medium">
										<span className="text-crypto-cyan">{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(pool.startTime)}</span>
										<span className="mx-2 w-1 h-1 rounded-full bg-white/20"></span>
										<span className="text-white">{pool.chain}</span>
										<span className="mx-2 w-1 h-1 rounded-full bg-white/20"></span>
										<span>${pool.price}</span>
									</div>
								</div>
							</div>

							<div className="text-crypto-cyan text-sm font-bold">
								Details
							</div>
						</div>

					</div>
				);
			})}
		</div>
	);
};
