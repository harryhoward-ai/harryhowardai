import { FC } from 'react';

interface ProgressBarProps {
	progress: number; // 0 to 100
}

export const ProgressBar: FC<ProgressBarProps> = ({ progress }) => {
	return (
		<div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
			<div
				className="h-full bg-gradient-to-r from-crypto-cyan to-crypto-purple shadow-[0_0_10px_rgba(0,243,255,0.5)]"
				style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
			/>
		</div>
	);
};
