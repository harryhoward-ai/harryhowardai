import { DFUserAvatar } from "@/components/Avatar/Avatar"
import { toCurrency } from "@/constats"
import xpIcon from "@/icons/xp-icon.svg"
import { LeaderBoardApi } from "@/utils/Api"
import { initData, useSignal } from "@telegram-apps/sdk-react"
import { useEffectOnActive } from "keepalive-for-react"
import { FC, useState } from "react"
import { Header } from "@/pages/Launchpad/components/Header"

type TopListItem = {
	id: string,
	rank: number,
	score: number,
	username: string,
	display_name: string,
	avatar: string,
}

export const GameCenter_TopPage: FC = () => {
	const initDataRaw = useSignal(initData.raw)
	const [_loading, setLoading] = useState(false);
	const [xpTopList, setXpTopList] = useState<TopListItem[]>([]);

	const getXpTop = async () => {
		setLoading(true);
		try {
			const result = await LeaderBoardApi.ndpTop(initDataRaw as string);
			setXpTopList(result);
		} finally {
			setLoading(false);
		}
	}

	useEffectOnActive(() => {
		getXpTop();
	}, [])

	const myRank = xpTopList.length > 0 ? xpTopList[xpTopList.length - 1] : null;

	return <div id="GameCenter_TopPage" className="w-full h-full flex flex-col items-center gap-2 bg-crypto-bg">
		<div className="w-full">
			<Header />
		</div>
		<h2 className="text-xl font-bold text-crypto-text py-4 w-full text-center">NP Leaderboard</h2>
		<LeaderboardList list={xpTopList.slice(0, -1)} />
		{myRank && <div className="w-full px-4 py-2 bg-crypto-bg border-t border-white/5 ">
			<LeaderboardItem item={myRank} highlight={true} />
		</div>}
		{/* Decorative Glow */}
		<div className="fixed top-0 left-0 w-full h-[300px] bg-crypto-cyan/10 blur-[100px] pointer-events-none" />

	</div>
}

const LeaderboardList: FC<{ list: TopListItem[] }> = ({ list }) => {
	return <div className="w-full flex flex-col gap-3 px-4 h-full overflow-y-auto">
		{
			list.map((item, i) => {
				return <LeaderboardItem key={i} item={item} />
			})
		}
	</div>
}

const LeaderboardItem: FC<{ item: TopListItem, highlight?: boolean }> = ({ item, highlight = false }) => {
	const rankColor = item.rank === 1 ? 'text-yellow-400' :
		item.rank === 2 ? 'text-gray-300' :
			item.rank === 3 ? 'text-amber-600' : 'text-crypto-muted';

	return (
		<div className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors
			${highlight
				? 'bg-crypto-card/80 border-crypto-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
				: 'bg-crypto-card/50 border-white/5 hover:bg-crypto-card'
			}`}>
			<div className="flex items-center gap-4">
				<span className={`w-6 text-center font-bold font-mono ${rankColor}`}>
					{item.rank === 0 ? "-" : `#${item.rank}`}
				</span>

				<div className="relative">
					<DFUserAvatar
						size={40}
						userId={item.id}
						avatarPath={item.avatar}
						displayName={item.display_name}
					/>
					{item.rank <= 3 && item.rank > 0 && (
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-crypto-bg rounded-full flex items-center justify-center border border-white/10">
							<span className="text-[10px]">
								{item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : '🥉'}
							</span>
						</div>
					)}
				</div>

				<div className="flex flex-col">
					<span className={`font-medium ${highlight ? 'text-crypto-cyan' : 'text-white'}`}>
						{item.display_name}
					</span>
					{/* Optional: Add username or other info here */}
				</div>
			</div>

			<div className="flex items-center gap-1.5 bg-crypto-bg/50 px-3 py-1.5 rounded-lg border border-white/5">
				<span className="text-crypto-cyan font-bold font-mono">{toCurrency(item.score, 0)}</span>
				<img src={xpIcon} className="w-7 h-7 opacity-80" alt="XP" />
			</div>
		</div>
	)
}