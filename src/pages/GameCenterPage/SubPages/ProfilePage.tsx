import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { Header } from "@/pages/Launchpad/components/Header";
import useDashFunSafeArea from "@/components/DashFun/DashFunSafeArea";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import { UserProfileUpdatedEvent } from "@/components/Event/Events";
import { dataURLtoBlob } from "@/components/Utils/File";
import { makeBrowserEnv } from "@/mockEnv";
import { AccApi, AccountType, DashFunAccount, FishingVerseApi, getAvatarUrl, getEnv } from "@/utils/Api";
import { isInTelegram } from "@/utils/Utils";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { Input, Modal } from "@telegram-apps/telegram-ui";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../Components/AvatarUploader";

export const GameCenter_Profile: FC = () => {
	const nav = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const { safeArea, content } = useDashFunSafeArea();
	const [dleteInput, setDeleteInput] = useState("");
	const [avatar, setAvatar] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const initDataRaw = useSignal(initData.raw);
	const user = useDashFunUser();

	const signOut = useCallback(() => {
		localStorage.removeItem('DashFun-Token-' + getEnv());
		setLoading(true);

		makeBrowserEnv("", "", "", AccountType.Email, "", "");
		initData.restore();

		setTimeout(() => {
			setLoading(false);
			nav("/game-center");
			window.location.reload();
		}, 1000);
	}, [nav]);

	const setAsAvatar = async () => {
		setUploading(true);
		FishingVerseApi.updateProfile(initDataRaw as string, {
			userId: "",
			nickname: "",
			avatar: avatar || "",
		}, dataURLtoBlob(avatar || "")).then((res) => {
			console.log("Fire Profile updated Event:", res);
			UserProfileUpdatedEvent.fire(res);
			window.location.reload(); // 重新加载页面以更新用户信息
		}).finally(() => {
			setUploading(false);
		});
	}

	const avatarVersion = user?.avatarUrl || "";
	let avatarUrl = "";
	if (avatarVersion != "") {
		avatarUrl = getAvatarUrl(user?.id || "", avatarVersion);
	}

	return <div id="GameCenter_Profile" className="w-full flex flex-col gap-4 bg-crypto-bg min-h-screen pb-24">
		<div className="w-full">
			<Header disableClick />
		</div>

		<div className="w-full px-4">
			<div className="w-full flex flex-col gap-4 p-6 rounded-2xl bg-crypto-card/50 border border-white/5 items-center justify-center relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/5 to-crypto-purple/5 pointer-events-none" />
				<h3 className="text-crypto-text font-bold text-lg z-10">Profile Avatar</h3>

				<AvatarUpload size={128}
					defaultAvatarUrl={avatarUrl}
					onAvatarSelected={(avatar) => { setAvatar(avatar) }} />
				{
					avatar && <CryptoButton
						className="w-full max-w-[200px] !py-2 !text-sm z-10"
						disabled={uploading}
						onClick={() => {
							setAsAvatar();
						}}>
						{uploading ? "Uploading..." : "Set as Avatar"}
					</CryptoButton>
				}

				{(!isInTelegram() && (
					<div className="w-full mt-4 border-t border-white/5 pt-4">
						<CryptoButton
							variant="secondary"
							fullWidth
							disabled={loading}
							onClick={() => {
								signOut();
							}}>
							Sign Out
						</CryptoButton>
					</div>
				))}
			</div>
		</div>

		{
			(
				!isInTelegram() /*&& isInDashFunApp() == 'ios'*/ && <div className="w-full px-4 mt-auto mb-4">
					<div className="w-full flex flex-col gap-4">
						<CryptoButton
							variant="secondary"
							fullWidth
							className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10"
							disabled={loading}
							onClick={() => {
								setShowDelete(true);
							}}>
							Delete My Account
						</CryptoButton>
					</div>

					<Modal
						className='max-w-screen-sm sm:mx-auto bg-crypto-card'
						open={showDelete}
						header={<ModalHeader style={{
							backgroundColor: "transparent",
						}}></ModalHeader>}
						onOpenChange={e => {
							if (e == false) {
								setShowDelete(false);
								setDeleteInput("");
							}
						}}
						snapPoints={[1]}
					>
						<div className='flex flex-col w-full h-full bg-crypto-card border-t border-white/10' style={{
							paddingBottom: safeArea.bottom + content.bottom
						}}>
							<div className="flex flex-col items-center justify-center gap-6 px-6 py-8">
								<h3 className="text-xl font-bold text-red-500">
									Delete My Account
								</h3>
								<p className="text-sm text-crypto-text text-center leading-relaxed">
									Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
								</p>

								<div className="w-full flex flex-col items-center gap-2">
									<div className="flex items-center gap-1.5 text-sm">
										<span className="text-crypto-muted">Please enter</span>
										<span className="font-bold text-red-500">"DELETE"</span>
										<span className="text-crypto-muted">below to confirm</span>
									</div>
									<Input
										className="w-full !bg-crypto-bg !text-crypto-text !border-white/10"
										type="text"
										value={dleteInput}
										placeholder="DELETE"
										onChange={(e) => {
											setDeleteInput(e.target.value);
										}}
									/>
								</div>

								<CryptoButton
									fullWidth
									className="!bg-gradient-to-r !from-red-600 !to-red-800 !text-white !border-none"
									disabled={loading || dleteInput.toUpperCase() !== "DELETE"}
									onClick={() => {
										setLoading(true);
										const token = localStorage.getItem('DashFun-Token-' + getEnv());
										if (token) {
											const decodedAcc = JSON.parse(atob(token)) as DashFunAccount;
											if (decodedAcc == null) {
												setLoading(false);
												return false;
											}
											AccApi.deleteAccount(decodedAcc.account_id, decodedAcc.token, decodedAcc.type).then(() => {
												signOut();
											}).catch((err) => {
												console.error("Failed to delete account:", err);
												setLoading(false);
											}).finally(() => {
												setLoading(false);
											});
										}
									}}
								>
									Delete My Account
								</CryptoButton>
							</div>
						</div>
					</Modal>

				</div>
			)
		}

	</div >
}

// const MyGames: FC = () => {
// 	const { gamelist, updateGameList, loading } = useGameCenterData();
// 	const [get] = useLanguage();
// 	const [recentList, setRecentList] = useState<string[]>([]);
// 	const [favoritesList, setFavoritesList] = useState<string[]>([]);

// 	const updateList = useCallback(() => {
// 		const recentList = gamelist?.game_list[GameListType.Played] ?? [];
// 		const favoritesList = gamelist?.game_list[GameListType.Favorites] ?? [];
// 		setRecentList(recentList);
// 		setFavoritesList(favoritesList);
// 	}, [gamelist])

// 	useEffectOnActive(() => {
// 		if (updateGameList) {
// 			updateGameList([GameListType.Played, GameListType.Favorites]).then(() => {
// 				updateList();
// 			})
// 		}
// 	}, [])

// 	useEffect(() => {
// 		updateList();
// 	}, [gamelist])

// 	return <div className="w-full flex flex-col gap-4">
// 		<Section
// 			header={get(LangKeys.ProfileRecentGames) as string}
// 		>
// 			{
// 				!loading && (recentList.length == 0 ?
// 					<DFText weight="1" size="m" color="#cccccc">
// 						<L langKey={LangKeys.ProfileNoRecentGame} />
// 					</DFText> :
// 					<div className="w-full overflow-x-auto hide-scrollbar">
// 						<div>
// 							<div className="grid grid-flow-col-dense auto-cols-max gap-4 min-h-[64px]">
// 								{recentList.map((gameId) => {
// 									const game = gamelist?.getGame(gameId);
// 									return <div className="flex flex-col justify-center items-center" style={{ width: 64 }} key={gameId}>
// 										<GameIcon game={game} size={64} onClick={() => { console.log("onclick") }}></GameIcon>
// 										<DFText weight="1" size="xs" className="w-full pt-2 truncate overflow-hidden min-w-0 text-center">
// 											{game?.name}
// 										</DFText>
// 									</div>
// 								})}
// 							</div>
// 						</div>
// 					</div>)
// 			}
// 		</Section>

// 		<Section
// 			header={get(LangKeys.ProfileFavoritesGames) as string}
// 			icon={<Heart stroke="0" fill="#ef4444" />}
// 		>
// 			{
// 				!loading && (favoritesList.length == 0 ?
// 					<DFText weight="1" color="#cccccc" size="m">
// 						<L langKey={LangKeys.ProfileNoFavoritesGame} />
// 					</DFText> :
// 					<div className="w-full overflow-x-auto hide-scrollbar">
// 						<div>
// 							<div className="grid grid-flow-col-dense auto-cols-max gap-2 min-h-[64px]">
// 								{favoritesList.reverse().map((gameId) => {
// 									const game = gamelist?.getGame(gameId);
// 									return <div className="flex flex-col justify-center items-center" style={{ width: 64 }} key={gameId}>
// 										<GameIcon game={game} size={64} onClick={() => { console.log("onclick") }}></GameIcon>
// 										<DFText weight="1" size="xs" className="w-full pt-2 truncate overflow-hidden min-w-0 text-center">
// 											{game?.name}
// 										</DFText>
// 									</div>
// 								})}
// 							</div>
// 						</div>
// 					</div>)
// 			}
// 		</Section>
// 	</div>
// }

// const MyFriends: FC = () => {
// 	return <div>My Friends</div>
// }