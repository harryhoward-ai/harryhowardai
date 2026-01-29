import { FACTIONS, HowardToken } from "@/constats";
import { Header } from '@/pages/Launchpad/components/Header';
import { Env, getBscScanLink, getEnv, SquadBetInfo, SquadGameApi, SquadRoundInfo } from "@/utils/Api";
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { Eip1193Provider, ethers } from 'ethers';
import { FC, useEffect, useState } from 'react';
import { BettingInterface } from './components/BettingInterface';
import { SettledRoundView } from './components/SettledRoundView';

// Faction Definitions moved to constants


export const LuckyBlockPage: FC = () => {
	//   const navigate = useNavigate();
	const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
	const [betAmount, setBetAmount] = useState<number | null>(null);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isLocked, setIsLocked] = useState(false);
	const [hasBet, setHasBet] = useState(false); // Quick local state for demo
	const [blockData, setBlockData] = useState({ height: 19284750, hash: '0x3a...8f2b', timestamp: Math.floor(Date.now() / 1000) });

	// SquadGame State
	const [roundInfo, setRoundInfo] = useState<SquadRoundInfo | null>(null);
	const [userBet, setUserBet] = useState<SquadBetInfo | null>(null);
	const [isGameActive, setIsGameActive] = useState(true);

	// Feedback State
	const [betStatus, setBetStatus] = useState<{ type: 'success' | 'error', message: React.ReactNode } | null>(null);

	const initDataRaw = useSignal(initData.raw);
	const tgToken = initDataRaw || "";

	// Wallet Connection
	const { open } = useAppKit();
	const { isConnected, address } = useAppKitAccount();
	const { walletProvider } = useAppKitProvider("eip155");

	// Unified Timer & Data Fetch Loop
	useEffect(() => {
		let fetchTick = 0;

		const gameLoop = async () => {
			const now = new Date();

			// --- 1. Timer Logic (Every 1s) ---
			const minutes = now.getMinutes();
			const locked = minutes >= 58;
			setIsLocked(locked);

			let target = new Date(now);
			if (locked) {
				// If locked, countdown to next hour (Hash Reveal)
				target.setHours(now.getHours() + 1, 0, 0, 0);
			} else {
				// If active, countdown to lock time (minute 58)
				target.setMinutes(58, 0, 0);
			}

			const diff = Math.floor((target.getTime() - now.getTime()) / 1000);
			setTimeLeft(diff > 0 ? diff : 0);

			// --- 2. Data Fetch Logic (Every 10s) ---
			if (fetchTick % 10 === 0 && isConnected && walletProvider) {
				// A. Block Data
				try {
					const provider = new ethers.BrowserProvider(walletProvider as Eip1193Provider);
					const block = await provider.getBlock('latest');

					if (block) {
						setBlockData({
							height: block.number,
							hash: block.hash || '',
							timestamp: block.timestamp
						});
					}
				} catch (error) {
					console.error("Failed to fetch block:", error);
				}

				// B. Game API Info
				if (tgToken && address) {
					try {
						const info = await SquadGameApi.info(tgToken, address);
						if (info) {
							setRoundInfo(info.round);
							setUserBet(info.bet);
							setIsGameActive(info.is_game_active);

							// Sync local state
							if (info.bet) {
								setHasBet(true);
								// Map faction index to ID
								// 0->bull, 1->bear, 2->whale, 3->ape
								const factionId = FACTIONS[info.bet.faction]?.id;
								if (factionId) setSelectedFaction(factionId);

								// Parse amount (Wei to Eth)
								const amt = parseFloat(ethers.formatEther(info.bet.amount));
								setBetAmount(amt);
							}
						}
					} catch (error) {
						console.error("Failed to fetch game info:", error);
					}
				}
			}

			fetchTick++;
		};

		// Run immediately
		gameLoop();

		const interval = setInterval(gameLoop, 1000);
		return () => clearInterval(interval);
	}, [isConnected, walletProvider, tgToken, address]);

	// Helper to render Tx Link
	const renderTxMsg = (prefix: string, txHash: string) => (
		<span>
			{prefix} Tx: <a href={getBscScanLink(txHash, 'tx')} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-white">{txHash.slice(0, 6)}...{txHash.slice(-4)}</a>
		</span>
	);

	const handlePlaceBet = async () => {
		if (!selectedFaction || !betAmount || isLocked || !address || !walletProvider) return;

		try {
			const provider = new ethers.BrowserProvider(walletProvider as Eip1193Provider);
			const signer = await provider.getSigner();
			const network = await provider.getNetwork();

			// Token Contract
			const tokenAddress = HowardToken.address;
			// TODO: Update this with the real SquadGame contract address
			const spenderAddress = HowardToken.squadGameAddress;

			const tokenAbi = [
				"function nonces(address owner) external view returns (uint256)",
				"function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external"
			];
			const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

			// Hardcoded derived from contract
			const version = "1";
			const tokenName = "Harry Howard AI";

			const n = await tokenContract.nonces(address);
			const nonce = Number(n);

			if (Number(network.chainId) !== 97) {
				console.warn("Warning: Current chain is not 97 (BSC Testnet)");
			}

			console.log("Permit Params:", { tokenName, version, nonce, chainId: network.chainId });

			const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
			const amountWei = ethers.parseEther(betAmount.toString());

			// EIP-2612 Permit
			const domain = {
				name: tokenName,
				version: version,
				chainId: Number(network.chainId),
				verifyingContract: tokenAddress
			};

			const types = {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" }
				]
			};

			const message = {
				owner: address,
				spender: spenderAddress,
				value: amountWei.toString(), // Convert BigInt to String
				nonce: Number(nonce),       // Convert BigInt to Number
				deadline: deadline
			};

			const signature = await signer.signTypedData(domain, types, message);

			const sig = ethers.Signature.from(signature);
			const factionIndex = FACTIONS.findIndex(f => f.id === selectedFaction);

			// Submit to API
			const txHash = await SquadGameApi.placeBet(tgToken, {
				faction: factionIndex,
				amount: amountWei.toString(),
				deadline: deadline.toString(),
				v: sig.v,
				r: sig.r,
				s: sig.s,
				address: address
			});

			setBetStatus({ type: 'success', message: renderTxMsg("Bet placed successfully!", txHash) });
			setHasBet(true);

		} catch (error: any) {
			console.error("Betting failed:", error);
			const errMsg = error.response?.data?.msg || error.message || error.toString();
			// alert(`Betting failed: ${errMsg}`);
			setBetStatus({ type: 'error', message: errMsg });
		}
	};

	const handleClaimReward = async (isWin: boolean) => {
		if (!tgToken || !address) return;
		try {
			const txHash = await SquadGameApi.claimRewards(tgToken, address);

			if (isWin) {
				setBetStatus({ type: 'success', message: renderTxMsg("Reward claimed successfully!", txHash) });
				// Optimistic update for win
				if (userBet) {
					setUserBet({ ...userBet, is_claimed: true });
				}
			} else {
				// For loss, silently claim (clear state) and reload
				window.location.reload();
			}

		} catch (error: any) {
			console.error("Claim failed:", error);
			const errMsg = error.response?.data?.msg || error.message || error.toString();
			setBetStatus({ type: 'error', message: errMsg });
		}
	};


	// Stats logic removed, using component

	return (
		<div className="w-full min-h-screen flex flex-col items-center bg-crypto-bg relative overflow-y-auto pb-20">
			<div className="w-full">
				<Header />
			</div>

			<div className="w-full px-4 pt-4 flex flex-col gap-6">

				{/* Header Card */}
				<div className="bg-crypto-card/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl text-center">
					<h2 className="text-2xl font-bold text-white mb-2">🎰 Squad Game</h2>
					<p className="text-crypto-muted text-sm mb-4">Guess the last digit of the next hourly block hash!</p>

					<div className="flex flex-col items-center justify-center mb-4">
						<span className={`text-sm font-bold uppercase tracking-widest mb-1 ${isLocked ? 'text-red-400' : 'text-crypto-muted'}`}>
							{isLocked ? 'WAITING FOR REVEAL' : 'BETTING CLOSES IN'}
						</span>
						<span className={`text-5xl font-mono font-bold tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.3)] ${isLocked ? 'text-red-500' : 'text-crypto-cyan'}`}>
							{Math.floor(timeLeft / 60)}m {timeLeft % 60}s
						</span>
					</div>

					{/* Real-time Block Info (Only when connected) */}
					{isConnected && (
						<div className="w-full bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-2 mb-2">
							{/* Block Height Row */}
							<div className="flex items-center justify-between text-xs">
								<span className="text-crypto-muted">Block Height:</span>
								<a
									href={`https://${getEnv() === Env.Prod ? "" : "testnet."}bscscan.com/block/${blockData.height}`}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono text-white font-bold hover:text-crypto-cyan transition-colors underline decoration-dotted"
								>
									{blockData.height}
								</a>
							</div>

							{/* Separator */}
							<div className="h-[1px] w-full bg-white/5" />

							{/* Timestamp Row */}
							<div className="flex items-center justify-between text-xs">
								<span className="text-crypto-muted">Timestamp:</span>
								<span className="font-mono text-white text-[10px]">
									{(() => {
										const now = Math.floor(Date.now() / 1000);
										const diff = Math.max(0, now - blockData.timestamp);
										const date = new Date(blockData.timestamp * 1000);

										const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
										const mon = monthNames[date.getUTCMonth()];
										const day = String(date.getUTCDate()).padStart(2, '0');
										const year = date.getUTCFullYear();

										let hours = date.getUTCHours();
										const ampm = hours >= 12 ? 'PM' : 'AM';
										hours = hours % 12;
										hours = hours ? hours : 12;
										const hh = String(hours).padStart(2, '0');
										const mm = String(date.getUTCMinutes()).padStart(2, '0');
										const ss = String(date.getUTCSeconds()).padStart(2, '0');

										const dateStr = `${mon}-${day}-${year} ${hh}:${mm}:${ss} ${ampm}`;

										return `${diff} secs ago (${dateStr} +UTC)`;
									})()}
								</span>
							</div>

							{/* Separator */}
							<div className="h-[1px] w-full bg-white/5" />

							{/* Block Hash Row */}
							<div className="flex items-center justify-between text-xs">
								<span className="text-crypto-muted">Block Hash:</span>
								<a
									href={`https://${getEnv() === Env.Prod ? "" : "testnet."}bscscan.com/block/${blockData.height}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{blockData.hash.length > 10 ? (
										<span>
											{blockData.hash.slice(0, 6)}...{blockData.hash.slice(-6, -1)}
											<span className="text-yellow-400 font-bold text-lg ml-[1px]">{blockData.hash.slice(-1)}</span>
										</span>
									) : (
										blockData.hash
									)}
								</a>
							</div>
						</div>
					)}
				</div>

				{/* Game Component Switcher */}
				{(() => {
					// 1. Settled State
					if (roundInfo && roundInfo.is_settled) {
						return (
							<SettledRoundView
								roundInfo={roundInfo}
								userBet={userBet}
								betStatus={betStatus}
								onClaimReward={handleClaimReward}
							/>
						);
					}

					// 2. Active Betting State
					return (
						<BettingInterface
							roundInfo={roundInfo}
							selectedFaction={selectedFaction}
							setSelectedFaction={setSelectedFaction}
							betAmount={betAmount}
							setBetAmount={setBetAmount}
							isLocked={isLocked}
							hasBet={hasBet}
							isConnected={isConnected}
							onPlaceBet={handlePlaceBet}
							onConnect={open}
							betStatus={betStatus}
							isGameActive={isGameActive}
						/>
					);
				})()}
			</div >
		</div >
	);
};
