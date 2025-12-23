import { FC, useEffect, useRef, useState } from "react";

export const CountDown: FC<{ remaining: number; title?: string; onEnd?: () => void; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ remaining = 0, title = "Check-in After", onEnd, className, size = 'lg' }) => {
	const [countdown, setCountdown] = useState<number>(remaining);
	const onEndRef = useRef(onEnd);

	// Update ref whenever onEnd changes
	useEffect(() => {
		onEndRef.current = onEnd;
	}, [onEnd]);

	useEffect(() => {
		setCountdown(remaining);
		const timer = setInterval(() => {
			setCountdown((prev) => {
				const next = prev - 1;
				if (next <= 0) {
					clearInterval(timer);
					if (onEndRef.current) onEndRef.current();
					return 0;
				}
				return next;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [remaining]);

	const hours = Math.floor(countdown / 3600);
	const minutes = Math.floor((countdown % 3600) / 60);
	const seconds = countdown % 60;

	// Size-based classes
	const isSmall = size === 'sm';
	const titleClass = isSmall ? "text-sm font-bold text-crypto-text uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-xl font-bold text-crypto-text uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]";
	const containerClass = isSmall ? "py-3 px-3 gap-2" : "py-6 px-4 gap-4";
	const separatorClass = isSmall ? "text-xl font-bold text-crypto-cyan animate-pulse mb-6" : "text-3xl font-bold text-crypto-cyan animate-pulse mb-8";

	return (countdown <= 0 ? null :
		<div className={`relative group p-[1px] rounded-2xl bg-gradient-to-br from-crypto-cyan/20 to-crypto-purple/20 ${className || "mx-4"}`}>
			<div className={`w-full flex flex-col items-center justify-center bg-crypto-card/90 backdrop-blur-md rounded-2xl border border-white/5 ${containerClass}`}>
				<span className={titleClass}>
					{title}
				</span>
				<div className="w-full flex flex-row items-center justify-center gap-2 sm:gap-4">
					<CountdownPanel countdown={hours} unit="Hr" size={size} />
					<span className={separatorClass}>:</span>
					<CountdownPanel countdown={minutes} unit="Min" size={size} />
					<span className={separatorClass}>:</span>
					<CountdownPanel countdown={seconds} unit="Sec" size={size} />
				</div>
			</div>
		</div>
	)
}

const CountdownPanel: FC<{ countdown: number, unit: string, size: 'sm' | 'md' | 'lg' }> = ({ countdown, unit, size }) => {
	const isSmall = size === 'sm';

	const boxClass = isSmall
		? "w-[40px] h-[35px] rounded-lg bg-crypto-bg border border-white/10 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
		: "w-[60px] sm:w-[70px] h-[50px] rounded-xl bg-crypto-bg border border-white/10 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

	const textClass = isSmall
		? "text-lg font-mono font-bold text-crypto-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]"
		: "text-2xl sm:text-3xl font-mono font-bold text-crypto-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]";

	const unitClass = isSmall
		? "text-[9px] font-medium text-crypto-muted uppercase tracking-widest"
		: "text-[10px] sm:text-xs font-medium text-crypto-muted uppercase tracking-widest";

	return (
		<div className="flex flex-col gap-1 items-center">
			<div className={boxClass}>
				<span className={textClass}>
					{countdown.toString().padStart(2, "0")}
				</span>
			</div>
			{!isSmall && (
				<div className="px-3 py-0.5 rounded-full bg-white/5 border border-white/5">
					<span className={unitClass}>
						{unit}
					</span>
				</div>
			)}
		</div>
	);
}