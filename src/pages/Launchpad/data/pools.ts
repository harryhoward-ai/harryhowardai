export interface PoolData {
	id: string;
	name: string;
	ticker: string;
	startTime: number; // Timestamp in milliseconds, acts as the date
	chain: string; // e.g., "TON", "ETH"
	price: number; // e.g., 0.05

	// Featured data (optional)
	raised?: number;
	target?: number;
	participants?: number;
}

export const ALL_POOLS: PoolData[] = [
	// Active/Featured Pool (Started)
	{
		id: '0',
		name: "Aura Network",
		ticker: "AURA",
		startTime: Date.now() - 100000, // Started in the past
		chain: "TON",
		price: 0.045,
		raised: 1250000,
		target: 1500000,
		participants: 3420
	},
	{
		id: '1',
		name: "Nolan Dev",
		ticker: "Nolan",
		startTime: Date.now() - 90000, // Started in the past
		chain: "BSC",
		price: 0.045,
		raised: 1250000,
		target: 1500000,
		participants: 3420
	},
	// Upcoming Pools
	{
		id: '2',
		name: 'NovaFi',
		ticker: 'NOVA',
		startTime: Date.now() + 86400000 * 2, // > 24 hours
		chain: "ETH",
		price: 1.2
	},
	{
		id: '3',
		name: 'Fishing Verse',
		ticker: 'FSV',
		startTime: Date.now() + 3600000 * 3, // 3 hours
		chain: "BSC",
		price: 0.05
	},
	{
		id: '4',
		name: 'Ethereal Exchange',
		ticker: 'ETX',
		startTime: Date.now() + 3600000 * 5, // 5 hours (Within 24h)
		chain: "SOL",
		price: 0.15
	},
	{
		id: '5',
		name: 'Solstice Protocol',
		ticker: 'SOLS',
		startTime: Date.now() + 86400000 * 10, // > 24 hours
		chain: "TON",
		price: 0.08
	},
];
