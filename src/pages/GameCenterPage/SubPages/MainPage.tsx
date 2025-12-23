import { Header } from "@/pages/Launchpad/components/Header";
import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { FeaturedPoolSection } from "@/pages/Launchpad/components/FeaturedPoolSection";
import { PoolsProvider } from "@/pages/Launchpad/context/PoolsContext";
import { initData, openTelegramLink, useSignal } from "@telegram-apps/sdk-react";
import { FC, useState } from "react";



import { FishingAvatar } from "@/components/Avatar/Avatar";
import { CountDown } from "@/components/CountDown/CountDown";
import { FishingPostData } from "@/constats";
import iconCheckin from "@/icons/icon-checkin2.png";
import { MarketsApi, NolanDevApi, TokenMarketInfo } from "@/utils/DashFunApi";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useEffectOnActive } from "keepalive-for-react";
import { Fish, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fmtUSD0 = (n: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const DailyCheckinButton: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [dailyCheckInRemaining, setDailyCheckInRemaining] = useState(-1);
	const nav = useNavigate();

	const updateDailyCheckInRemaining = async () => {
		const remaining = await NolanDevApi.checkinRemaining(initDataRaw as string)
		setDailyCheckInRemaining(remaining);
		// Removed redundant interval - CountDown handles ticking now.
	};


	useEffectOnActive(() => {
		updateDailyCheckInRemaining();
	}, [])

	return <>
		{dailyCheckInRemaining == 0 && (
			<div className="relative mx-4 group cursor-pointer p-[1px] rounded-2xl bg-gradient-to-r from-crypto-cyan to-crypto-purple transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
				onClick={() => {
					if (dailyCheckInRemaining == 0) {
						nav("/game-center/daily-checkin");
					}
				}}>
				<div className="relative bg-transparent rounded-2xl p-4 flex gap-4 items-center justify-center">
					<img src={iconCheckin} alt="Check-in Icon" className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
					<div className="flex flex-col">
						<span className="text-xl lg:text-2xl font-bold text-white">Daily Check-in</span>
						<span className="text-white/80 text-sm">Claim Rewards</span>
					</div>
				</div>
			</div>
		)}
		{
			dailyCheckInRemaining > 0 && <CountDown remaining={dailyCheckInRemaining} onEnd={() => setDailyCheckInRemaining(0)} />
		}
	</>
}

export const GameCenter_MainPage: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<FishingPostData[]>([]);
	const [tokenMap, setTokenMap] = useState<{ [symbol: string]: TokenMarketInfo }>({});

	const getPosts = async () => {
		try {
			setLoading(true);
			const posts = await NolanDevApi.getPosts(initDataRaw as string);
			setPosts(posts);
		} catch (error) {
			console.error("Failed to fetch posts:", error);
			setPosts([]);
		} finally {
			setLoading(false);
		}
	}

	const updateTokenMarketsInfo = async () => {
		const marketsInfo = await MarketsApi.get(initDataRaw as string, ["bitcoin", "ethereum"]);
		const tokenMap: { [symbol: string]: TokenMarketInfo } = {};
		marketsInfo.forEach(token => {
			tokenMap[token.symbol] = token;
		});
		setTokenMap(tokenMap);
		console.log("Token markets info updated", tokenMap);
	}

	useEffectOnActive(() => {
		getPosts();
		const handler = window.setInterval(() => {
			updateTokenMarketsInfo();
		}, 1000);

		return () => {
			window.clearInterval(handler);
		}

	}, [])

	const btcInfo = tokenMap["btc"];
	const ethInfo = tokenMap["eth"];

	if (btcInfo != null) {
		btcInfo.brief = btcInfo.brief.replace("${price}", fmtUSD0(btcInfo.current_price));
	}
	if (ethInfo != null) {
		ethInfo.brief = ethInfo.brief.replace("${price}", fmtUSD0(ethInfo.current_price));
	}

	return <div id="GameCenter_MainPage" className="w-full min-h-screen flex flex-col gap-4 bg-crypto-bg pb-24 relative overflow-hidden">
		<div className="w-full">
			<Header />
		</div>
		<div className="w-full flex flex-col gap-4">
			<DailyCheckinButton />
			<div className="w-full px-4">
				<div className="w-full flex justify-between items-center p-4 rounded-xl bg-crypto-card/50 border border-white/5">
					<span className="text-crypto-text font-medium">Join Community</span>
					<CryptoButton
						className="!px-6 !py-2 !text-sm"
						onClick={() => {
							openTelegramLink("https://t.me/+YkV3fvCBvFxmMDVl");
						}}>
						Join
					</CryptoButton>
				</div>
			</div>

			<div className="w-full px-4">
				<PoolsProvider>
					<FeaturedPoolSection />
				</PoolsProvider>
			</div>

			<div className="w-full px-4 flex flex-col gap-4">
				<h3 className="text-lg font-bold text-crypto-text flex items-center gap-2">
					Updates <span className="w-1.5 h-1.5 rounded-full bg-crypto-cyan animate-pulse"></span>
				</h3>

				<div className="w-full flex flex-col gap-3">
					{loading && <div className="w-full flex justify-center items-center py-4">
						<Spinner size="l" />
					</div>}
					{posts && posts.map((post) => (
						<AnglerUpdate
							key={post.postId}
							userId={post.userId}
							displayName={post.posterName}
							location={post.location}
							postTime={post.createdAt / 1000} // 转换为秒
							post={post.content}
							fish={""}
							avatarPath={""} />
					))}
				</div>
			</div>
		</div>

		{/* Decorative Glow */}
		<div className="fixed top-0 left-0 w-full h-[300px] bg-crypto-cyan/10 blur-[100px] pointer-events-none z-0" />

	</div>
}

// const MatchCell: FC = () => {
// 	return <div
// 		className="relative rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] aspect-[2/1] overflow-hidden"
// 		style={{
// 			backgroundImage: `url(${matchbg})`,
// 			backgroundSize: "cover",
// 			backgroundPosition: "center",
// 			backgroundRepeat: "no-repeat",
// 		}}
// 	>
// 		{/* 渐变色边框层 */}
// 		<div
// 			className="absolute inset-0 rounded-xl pointer-events-none z-10"
// 			style={{
// 				border: "2px solid transparent",
// 				background: "linear-gradient(to bottom, #dcdcae, #726c3f) border-box",
// 				WebkitMask:
// 					"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
// 				WebkitMaskComposite: "xor",
// 				maskComposite: "exclude",
// 			}}
// 		></div>
// 		<div
// 			className="absolute w-full h-full flex items-end justify-start p-8 pb-8">
// 			<DFText weight="1" size="4xl">
// 				Lakeside Tournament
// 			</DFText>
// 		</div>
// 		<div className="absolute top-8 -right-12 rotate-45 w-48">
// 			<div className="bg-gradient-to-br from-green-600 to-green-700
//                 text-white text-lg sm:text-sm font-semibold tracking-wider
//                 text-center py-2 shadow-md">
// 				Coming Soon
// 			</div>
// 		</div>


// 	</div >
// }


const AnglerUpdate: FC<{ userId: string, avatarPath: string, displayName: string, location: string, fish: string, postTime: number, post: string }> = (user) => {
	const now = Date.now() / 1000;
	const diff = Math.max(0, now - user.postTime);

	let timeAgo = "just now";
	if (diff < 60) {
		timeAgo = "just now";
	} else if (diff < 3600) {
		const mins = Math.floor(diff / 60);
		timeAgo = `${mins} minute${mins > 1 ? "s" : ""} ago`;
	} else if (diff < 86400) {
		const hours = Math.floor(diff / 3600);
		timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else {
		const days = Math.floor(diff / 86400);
		const hours = Math.floor((diff % 86400) / 3600);
		timeAgo = `${days} day${days > 1 ? "s" : ""}${hours > 0 ? ` ${hours} hour${hours > 1 ? "s" : ""}` : ""} ago`;
	}

	return (
		<div className="w-full flex flex-col gap-3 p-4 rounded-xl bg-crypto-card/50 border border-white/5 hover:bg-crypto-card transition-colors">
			<div className="w-full flex gap-3 items-center">
				<FishingAvatar size={42} userId={user.userId} displayName={user.displayName} />
				<div className="flex flex-col">
					<span className="text-white font-bold">{user.displayName}</span>
					<span className="text-crypto-muted text-xs">{timeAgo}</span>
				</div>
			</div>

			<p className="text-sm text-crypto-text/90 leading-relaxed">
				{user.post}
			</p>

			{(user.location || user.fish) && (
				<div className="flex items-center gap-4 text-xs font-medium">
					{user.location && (
						<div className="flex items-center gap-1 text-crypto-cyan">
							<MapPin size={14} />
							<span>{user.location}</span>
						</div>
					)}
					{user.fish && (
						<div className="flex items-center gap-1 text-crypto-purple">
							<Fish size={14} />
							<span>{user.fish}</span>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
