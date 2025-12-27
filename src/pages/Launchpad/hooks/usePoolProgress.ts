import { useEffect, useState } from 'react';
import { PoolData } from '../data/pools';

export const usePoolProgress = (pool: PoolData) => {
	const [stats, setStats] = useState({
		progressFactor: 0,
		percentage: 0,
		displayRaised: 0,
		displayParticipants: 0,
		isStarted: false,
		isEnded: false
	});

	useEffect(() => {
		const updateStats = () => {
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

			setStats({
				progressFactor,
				percentage: progressFactor * 100,
				displayRaised: targetRaised * progressFactor,
				displayParticipants: Math.floor(targetParticipants * progressFactor),
				isStarted,
				isEnded
			});
		};

		// Initial update
		updateStats();

		let timeoutId: NodeJS.Timeout;

		const scheduleUpdate = () => {
			const delay = Math.floor(Math.random() * (120000 - 30000 + 1) + 30000); // 30s to 120s
			timeoutId = setTimeout(() => {
				updateStats();
				scheduleUpdate();
			}, delay);
		};

		scheduleUpdate();

		return () => clearTimeout(timeoutId);
	}, [pool]);

	return stats;
};
