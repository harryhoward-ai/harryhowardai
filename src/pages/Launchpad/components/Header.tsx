import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { CoinPanel } from '@/components/Coins/coins';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenDisplay } from './TokenDisplay';
import { HowardToken, TestToken } from '@/constats';
import { Env, getEnv } from '@/utils/Api';

export const Header: FC<{ disableClick?: boolean }> = memo(({ disableClick = false }) => {
	const navigator = useNavigate();
	const user = useDashFunUser();

	const onHeaderClicked = () => {
		if (!disableClick) {
			navigator("/game-center/profile");
		}
	}

	const env = getEnv();
	let token = HowardToken;
	if (env != Env.Prod) {
		token = TestToken;
	}

	console.log("token is", token)

	//const l = useLocation();

	//所有页面都强制暗色
	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();

	const dp = getCoinInfo("NolanDevPoint", "name");

	return (
		<div className="bg-crypto-bg pb-2">
			<div className="px-5 pt-6 pb-2 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<DFProfileAvatar size={48} onClick={onHeaderClicked} />
					<h1 className="text-3xl font-bold text-crypto-text">Hello, {user?.nickname}</h1>
				</div>
				<div>
					<CoinPanel coin={dp?.coin} userCoinData={dp?.userData} />
				</div>
			</div>

			<div className="px-5 pb-4 flex items-center gap-2">
				<appkit-button />
				<TokenDisplay tokenAddress={token.address} tokenIcon={token.icon} />
			</div>

			{/* Enhanced Neon Separator */}
			<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-crypto-cyan to-transparent opacity-50 shadow-[0_0_15px_rgba(0,243,255,0.6)]" />
		</div>
	);
});
