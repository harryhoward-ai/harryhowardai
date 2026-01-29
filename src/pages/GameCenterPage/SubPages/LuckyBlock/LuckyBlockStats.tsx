import { FC, useMemo } from 'react';
import HHAIcon from "@/icons/howardai-icon.png";

export interface LuckyBlockFaction {
	id: string;
	name: string;
	icon: string;
	amount: number;
	color: string;
	barColor: string;
	[key: string]: any; // Allow other props
}

interface LuckyBlockStatsProps {
	className?: string;
	pools?: string[]; // Array of 4 strings (Wei amounts)
}

export const LuckyBlockStats: FC<LuckyBlockStatsProps> = ({ className, pools }) => {
	// Static definitions
	const definitions = [
		{ id: 'bull', icon: '🐂', name: 'Bull', color: 'text-green-400', bg: 'bg-green-500', barColor: 'bg-green-500' },
		{ id: 'bear', icon: '🐻', name: 'Bear', color: 'text-red-400', bg: 'bg-red-500', barColor: 'bg-red-500' },
		{ id: 'whale', icon: '🐳', name: 'Whale', color: 'text-blue-400', bg: 'bg-blue-500', barColor: 'bg-blue-500' },
		{ id: 'ape', icon: '🦍', name: 'Ape', color: 'text-purple-400', bg: 'bg-purple-500', barColor: 'bg-purple-500' },
	];

	// Process data: Merge definitions with real pool data
	const processedFactions = useMemo(() => {
		const factions = definitions.map((def, index) => {
			const amountWei = pools ? pools[index] : "0";
			// Convert Wei to Eth/Number
			const amount = parseFloat(Number(BigInt(amountWei) / 1000000000000000000n).toString()) + (Number(BigInt(amountWei) % 1000000000000000000n) / 1e18);
			return { ...def, amount };
		});

		const sorted = [...factions].sort((a, b) => b.amount - a.amount);
		const totalAmount = sorted.reduce((sum, f) => sum + f.amount, 0);
		const maxAmount = sorted[0]?.amount || 1; // Avoid divide by zero

		return sorted.map(f => ({
			...f,
			percentOfTotal: totalAmount > 0 ? (f.amount / totalAmount) * 100 : 0,
			barWidth: maxAmount > 0 ? (f.amount / maxAmount) * 100 : 0
		}));
	}, [pools]);

	return (
		<div className={`flex flex-col gap-3 ${className || ''}`}>
			{processedFactions.map((f, index) => (
				<div key={f.id} className="w-full">
					{/* Info Row: Icon+Name ... Amount(Percent) */}
					<div className="flex items-center justify-between mb-1 text-xs font-bold text-white">
						<div className="flex items-center gap-2">
							<span className="text-base">{f.icon}</span>
							<span className={f.color}>{f.name}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="flex items-center gap-1">
								{f.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								<img src={HHAIcon} className="w-5 h-5 opacity-70" alt="HHA" />
							</span>
							<span className="text-white/50 text-[10px]">({f.percentOfTotal.toFixed(1)}%)</span>
						</div>
					</div>

					{/* Progress Bar Container */}
					<div className="w-full h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
						{/* Progress Bar */}
						<div
							className={`h-full rounded-full transition-all duration-500 ${f.barColor} ${index === 0 ? 'opacity-100' : 'opacity-70'}`}
							style={{ width: `${f.barWidth}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	);
};
