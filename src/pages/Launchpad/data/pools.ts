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
	description?: string;
	minAllocation?: number;
	maxAllocation?: number;
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
		participants: 3420,
		description: "Aura Network is a scalable, agile and effortless Layer-1 blockchain with a comprehensive ecosystem built to accelerate global NFTs adoption.",
		minAllocation: 100,
		maxAllocation: 2000
	},
	// Upcoming Pools
	{
		id: '2',
		name: 'NovaFi',
		ticker: 'NOVA',
		startTime: Date.now() + 86400000 * 2, // > 24 hours
		chain: "ETH",
		price: 1.2,
		description: "NovaFi is the first decentralized exchange built on Ethereum that offers a seamless trading experience with low fees and high speed.",
		minAllocation: 200,
		maxAllocation: 5000
	},
	{
		id: '4',
		name: 'Ethereal Exchange',
		ticker: 'ETX',
		startTime: Date.now() + 3600000 * 5, // 5 hours (Within 24h)
		chain: "SOL",
		price: 0.15,
		description: "Ethereal Exchange is a next-generation decentralized exchange on Solana, designed for high-frequency trading and liquidity provision.",
		minAllocation: 50,
		maxAllocation: 1000
	},
	{
		id: '5',
		name: 'Solstice Protocol',
		ticker: 'SOLS',
		startTime: Date.now() + 86400000 * 10, // > 24 hours
		chain: "TON",
		price: 0.08,
		description: "Solstice Protocol is a privacy-preserving DeFi protocol on TON, enabling anonymous transactions and secure yield farming.",
		minAllocation: 100,
		maxAllocation: 2500
	},
];
