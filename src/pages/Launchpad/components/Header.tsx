import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { CoinPanel } from '@/components/Coins/coins';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: FC<{ disableClick?: boolean }> = ({ disableClick = false }) => {
	const navigator = useNavigate();
	const user = useDashFunUser();

	const onHeaderClicked = () => {
		if (!disableClick) {
			navigator("/game-center/profile");
		}
	}

	//const l = useLocation();

	//所有页面都强制暗色
	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();

	const dp = getCoinInfo("NolanDevPoint", "name");

	return (
		<div className="bg-crypto-bg pb-2">
			<div className="px-5 pt-6 pb-2 flex items-center justify-between">
				{/* <div className="flex items-center gap-2 mb-4">
					<div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
						<Wallet size={16} className="text-white" />
					</div>
					<div>
						<div className="flex items-center gap-1.5">
							<span className="text-white font-bold text-sm">Wallet</span>
							<div className="bg-green-500 rounded-full p-0.5">
								<Check size={10} className="text-black stroke-[4]" />
							</div>
						</div>
						<div className="text-slate-400 text-xs">Connected: 0x1234...abcd</div>
					</div>
				</div> */}
				<div className="flex items-center gap-3 mb-4">
					<DFProfileAvatar size={48} onClick={onHeaderClicked} />
					<h1 className="text-3xl font-bold text-crypto-text">Hello, {user?.nickname}</h1>
				</div>
				<div>
					<CoinPanel coin={dp?.coin} userCoinData={dp?.userData} />
				</div>
			</div>

			{/* Enhanced Neon Separator */}
			<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-crypto-cyan to-transparent opacity-50 shadow-[0_0_15px_rgba(0,243,255,0.6)]" />
		</div>
	);
};
