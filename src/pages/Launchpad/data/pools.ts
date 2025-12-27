export interface PoolData {
	id: string;
	name: string;
	ticker: string;
	startTime: number; // Timestamp in milliseconds, acts as the date
	endTime?: number; // Timestamp in milliseconds
	chain: string; // e.g., "TON", "ETH"
	price: number; // e.g., 0.05

	// Featured data (optional)
	raised?: number;
	target?: number;
	participants?: number;
	targetParticipants?: number;
	description?: string;
	minAllocation?: number;
	maxAllocation?: number;

	// Socials
	website?: string;
	x?: string;
	telegram?: string;

	// Branding
	icon?: string;
}


export const ALL_POOLS: PoolData[] = [
	// Active/Featured Pool (Started)
	{
		id: '0',
		name: "Fishing Verse",
		ticker: "FSV",
		startTime: 1766819439847 + 50 * 50 * 1000, // Started in the past
		endTime: 1766819439847 + 50 * 50 * 1000 + 86400000 * 1, // Ends in 1 days
		chain: "BSC",
		price: 0.040,
		raised: 250000,
		target: 1600000,
		participants: 320,
		targetParticipants: 3989,
		description: "Fishing Verse is a Web3-powered fishing universe that transforms real-world angling into verifiable digital identity, on-chain assets, and community-driven rewards.",
		minAllocation: 100,
		maxAllocation: 2000,
		website: "https://www.fishing-verse.com",
		x: "https://x.com/fishverseweb3/",
		telegram: "https://t.me/FishVerseweb3group",
		icon: "https://res.fishing-verse.com/icons/icon-fishing.png" // Example placeholder
	},
	// Upcoming Pools
	{
		id: '2',
		name: 'NovaFi',
		ticker: 'NOVA',
		startTime: Date.now() + 86400000 * 2, // > 24 hours
		endTime: Date.now() + 86400000 * 5,
		chain: "ETH",
		price: 1.2,
		target: 5000000,
		targetParticipants: 10000,
		description: "NovaFi is the first decentralized exchange built on Ethereum that offers a seamless trading experience with low fees and high speed.",
		minAllocation: 200,
		maxAllocation: 5000,
		website: "https://novafi.io",
		x: "https://x.com/novafi",
		telegram: "https://t.me/novafi"
	},
	{
		id: '4',
		name: 'Ethereal Exchange',
		ticker: 'ETX',
		startTime: Date.now() + 3600000 * 55, // 5 hours (Within 24h)
		endTime: Date.now() + 3600000 * 55 + 86400000,
		chain: "SOL",
		price: 0.15,
		target: 200000,
		targetParticipants: 1500,
		description: "Ethereal Exchange is a next-generation decentralized exchange on Solana, designed for high-frequency trading and liquidity provision.",
		minAllocation: 50,
		maxAllocation: 1000,
		website: "https://ethereal.exchange",
		x: "https://x.com/ethereal",
		telegram: "https://t.me/ethereal"
	},
	{
		id: '5',
		name: 'Solstice Protocol',
		ticker: 'SOLS',
		startTime: Date.now() + 86400000 * 10, // > 24 hours
		endTime: Date.now() + 86400000 * 15,
		chain: "TON",
		price: 0.08,
		target: 800000,
		targetParticipants: 3000,
		description: "Solstice Protocol is a privacy-preserving DeFi protocol on TON, enabling anonymous transactions and secure yield farming.",
		minAllocation: 100,
		maxAllocation: 2500,
		website: "https://solstice.protocol",
		x: "https://x.com/solstice",
		telegram: "https://t.me/solstice"
	},
];
