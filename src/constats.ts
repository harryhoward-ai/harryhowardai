import { GameData } from "./components/DashFunData/GameData";
import dashfunIcon from "./icons/howardai-icon.png";
import dashfunPointIcon from "./icons/xp-icon.svg";
import dashfunCoinIcon from "./icons/xp-icon.svg";
import npIcon from "./icons/xp-icon.svg";
import leaderboardIcon from "./icons/leaderboard.png";
import iconX from "./icons/icon-x.png";
import iconTg from "./icons/icon-telegram.png";

import dialyLoginIcon from "./icons/icon-calendar.png";
import { getImageUrl } from "./utils/Api";


export const DashFunCoins = {
	DashFunXP: "DashFunPoint",
	DashFunCoin: "DashFunCoin",
}

export const HowardToken = {
	address: "0x9DB1ac6a2E8a10A095318ED15B3221E79539BF54",
	squadGameAddress: "0x683fB52aB495A06Eeb71425629Baa0cCb4ed23c0",
	icon: "https://res.harryhowardai.com/icons/howardai-icon-512.png"
};

export const TestToken = {
	address: "0x9DB1ac6a2E8a10A095318ED15B3221E79539BF54",
	squadGameAddress: "0x683fB52aB495A06Eeb71425629Baa0cCb4ed23c0",
	icon: "https://res.harryhowardai.com/icons/howardai-icon-512.png"
};

//Recharge
export const RechargePriceType = {
	USD: 1,
	TGSTAR: 2,
}

export const RechargePriceTypeText: { [key: number]: string } = {
	1: "USD",
	2: "TGS",
}

//Task
export type Task = {
	id: string
	create_time: number
	priority: number
	game_id: string
	category: number
	name: string
	open: boolean
	task_type: number
	require: {
		condition: string
		count: number
		link: string
		type: number
	}
	rewards: {
		amount: number
		reward_type: number
	}[]
}

export const GetTaskIcon = (task: Task): string => {
	switch (task.require.type) {
		case TaskCondition.DailyLogin:
			return dialyLoginIcon;
		case TaskCondition.LeaderboardRank:
			return leaderboardIcon;
		case TaskCondition.FollowX:
			return iconX;
		case TaskCondition.JoinTGChannel:
			return iconTg;
		case TaskCondition.PlayGame:
			return getImageUrl(task.game_id, "icon.png");
		case TaskCondition.PlaySpecificGame:
			return getImageUrl(task.require.condition, "icon.png");
		default:
			return dashfunIcon;
	}

}

export const TaskType = {
	Normal: 1,
	Daily: 2,
	TwoDays: 3
}

export const TaskCondition = {
	PlayRandomGame: 1,
	PlayGame: 2,
	LevelUp: 3,
	JoinTGChannel: 4,
	FollowX: 5,
	SpendDiamond: 6,
	BindWallet: 7,
	PlaySpecificGame: 8,
	InviteFriends: 9,
	EnterDashFun: 10,
	DailyLogin: 11,
	Recharge: 12,
	SpendTGStar: 13,
	LeaderboardRank: 14,
}

export const TaskStatus = {
	InProgress: 1,//任务正在进行中
	Verify_Pending: 2,                       //任务需要验证
	Completed: 3,                         //任务完成
	Claimed: 4,
	ReturnInProgress: 5,//专门给follow x类型使用的状态，视为InProgress
}

export const TaskRewardType = {
	DashFunToken: 1,//奖励DashFunToken
	DashFunPoint: 2,
	GamePoint: 3, //奖励游戏对应的点数
	Diamond: 4,
	Ticket: 5,
}

export const TaskCategory = {
	Challenges: 1,
	Daily: 2,
	Done: 4, //已完成的任务，客户端单独归类
	Claimable: 5, //可领取奖励的任务，客户端单独归类
}

export const TaskCategoryText: { [key: number]: string } = {
	1: "Challenges",
	2: "Daily",
	3: "7 Days Challenges",
	4: "Done", //已完成的任务，客户端单独归类
	5: "Ready To Claim"
}

export type TaskSave = {
	progress: number
	save_data: string
	status: number
	task_id: string
	user_id: string
	time: number
}

//Coin
export type Coin = {
	id: string
	name: string
	symbol: string
	desc: string
	bind_game_id: string 				//绑定的游戏id
	can_withdraw: boolean				//是否可以提取
	min_withdraw: number             	//最低提取金额
	chain_addr: { [key: string]: string }      //链上地址，chainName->address
}

export type CoinUserData = {
	coin_id: string
	user_id: string
	amount: number
	create_time: number
}

export type CoinInfo = {
	coin: Coin,
	userData: CoinUserData
}

export const RechargeOrderStatus = {
	New: 1,
	Pending: 2,
	Failed: 3,
	Canceled: 4,
	Paid: 5,
	Completed: 6,
}

export const getCoinIcon1 = (coin: Coin | null | undefined) => {
	if (coin == null) {
		return "";
	}
	if (coin.bind_game_id == "" || coin.bind_game_id == "-1") {
		return getCoinIcon(coin.name);
	} else {
		return getImageUrl(coin.bind_game_id, "coin.png");
	}
}

export const getCoinIcon = (coinName: "DashFunCoin" | "DashFunPoint" | "DashFunDiamond" | string) => {
	console.log("get coin icon:", coinName)
	switch (coinName) {
		case "DashFunCoin":
			return dashfunCoinIcon;
		case "DashFunPoint":
			return dashfunPointIcon;
		case "NolanDevPoint":
			return npIcon;
		default:
			return dashfunIcon;
	}
};

export const GameGenre = {
	New: 1,
	Popular: 2,
	RPG: 1001,
	Card: 1002,
	Strategy: 1003,
};

export const GameDashFun = () => new GameData({
	id: "DashFun",
	name: "DashFun",
	genre: [],
	desc: "",
	iconUrl: "https://res.dashfun.games/icons/dashfun-icon-256.png",
	logoUrl: "",
	mainPicUrl: "",
	openTime: 0,
	time: 0,
	url: "",
	status: 0,
	suggest: 0
});


export const formatNumber = (num: number | null | undefined, precision: number = 2): string => {
	if (num === null || num === undefined) {
		num = 0;
	}
	const format = (n: number) => n.toFixed(precision).replace(/\.?0+$/, '');
	if (num >= 1_000_000_000) {
		return format(num / 1_000_000_000) + 'b';
	} else if (num >= 1_000_000) {
		return format(num / 1_000_000) + 'm';
	} else if (num >= 1_000) {
		return format(num / 1_000) + 'k';
	} else {
		return format(num);
	}
};

export const toCurrency = (num: number, digits: number = 2): string => {
	return num.toLocaleString('en-US', { style: "decimal", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export enum SpinWheelRewardType {
	DashFunPoint = 1,
}

export type SpinWheelReward = {
	reward_index: number,
	reward_type: SpinWheelRewardType,
	reward_value: number,
}

export enum SpinWheelUserStatus {
	Spin = 1,
	Claimable = 2,
	Claimed = 3,
}

export type SpinWheelInfo = {
	user_id: string,
	game_id: string,
	spinwheel_id: string,
	rewards: SpinWheelReward[],
	/**
	 * 中奖索引
	 */
	reward_index: number,
	reward_value: number,
	status: SpinWheelUserStatus,
	/**
	 * 已抽奖次数
	 */
	count: number,
	/**
	 * 抽奖需要的票的数量，数组长度就是抽奖次数上限
	 */
	tickets_needed: number[],

	/**
	 * 票的价格
	 */
	ticket_price: number,

	/**
	 * 重置次数时间
	 */
	reset_time: number,
}

export type FishingVerseUserProfile = {
	userId: string,
	nickname: string,
	avatar: string,
}

export type FishingPostData = {
	postId: string;        // 帖子ID
	userId: string;        // 用户ID
	posterName: string;    // 帖子发布者名称
	content: string;       // 帖子内容
	createdAt: number;     // 帖子创建时间 (timestamp)
	location: string;      // 帖子位置
	fishCatch: string;     // 钓鱼种类
}

export enum PricePredictStatus {
	Unsubmitted = 0,
	Pending = 1,
	Revealed = 2,
	Claimed = 3
}

export type PricePredictData = {
	id: string;
	user_id: string;
	wallet_address: string;
	predict_date: string;
	predict_price: number;
	status: PricePredictStatus;
	reward_points: number;
	create_time: number;
	update_time: number;
	bet_amount: number;
	real_price: number;
}

export type PricePredictConfig = {
	open: boolean;
	bet_start_time: number;
	bet_end_time: number;
	reveal_time: number;
	symbol: string;
	max_diff_limit: number;
	consolation_rate: number;
	bet_amounts: number[];
	pool_info: {
		rollover_pool: number;
		today_pool: number;
		total_pool: number;
		user_count: number;
		symbol: string;
	}
}

export const PricePredictSymbolMap: { [key: string]: string } = {
	"BNB": "binancecoin",
	"BTC": "bitcoin",
	"ETH": "ethereum",
	"TON": "the-open-network",
}

// Squad Game Factions
export const FACTIONS = [
	{ id: 'bull', icon: '🐂', name: 'Bull', slogan: 'To The Moon!', numbers: [0, 4, 8, 12], color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', hover: 'hover:bg-green-500/30' },
	{ id: 'bear', icon: '🐻', name: 'Bear', slogan: 'Short it!', numbers: [1, 5, 9, 13], color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', hover: 'hover:bg-red-500/30' },
	{ id: 'whale', icon: '🐳', name: 'Whale', slogan: 'Market Maker.', numbers: [2, 6, 10, 14], color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', hover: 'hover:bg-blue-500/30' },
	{ id: 'ape', icon: '🦍', name: 'Ape', slogan: 'All in!', numbers: [3, 7, 11, 15], color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', hover: 'hover:bg-purple-500/30' },
];
