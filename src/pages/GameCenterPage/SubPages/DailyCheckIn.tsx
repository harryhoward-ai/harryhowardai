import AddLocation from "@/components/AddLocation/AddLocation";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import { CryptoButton } from "@/pages/Launchpad/components/CryptoButton";
import { Header } from "@/pages/Launchpad/components/Header";
import { NolanDevApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

export const FishingVerse_DailyCheckIn: FC = () => {
	const user = useDashFunUser();
	const initDataRaw = useSignal(initData.raw);
	const nav = useNavigate();
	const [post, setPost] = useState("");
	const [location, setLocation] = useState<string>("");
	const [fish, setFish] = useState<string>("");
	const [posting, setPosting] = useState(false);

	const sendPost = async () => {
		if (post.trim() === "") {
			return;
		}
		setPosting(true);
		try {
			await NolanDevApi.post(initDataRaw as string, post, location, fish);
			setPost("");
			setLocation("");
			setFish("");
			nav("/game-center/main");
		} catch (e) {
			console.error("Failed to create post:", e);
		} finally {
			setPosting(false);
		}
	}

	return <div id="GameCenter_Profile" className="w-full h-full flex flex-col items-center bg-crypto-bg relative overflow-hidden">
		{/* Gradient Overlay */}
		<div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/5 to-crypto-purple/5 pointer-events-none z-0"></div>

		{/* Full Width Header */}
		<div className="w-full ">
			<Header />
		</div>

		<div className="w-full flex flex-col items-center gap-4 px-4 pt-2 pb-1 z-10">
			<div className="w-full flex items-center justify-between">
				<button
					className="text-crypto-muted hover:text-crypto-text transition-colors text-lg"
					onClick={() => {
						setPost("");
						setLocation("");
						setFish("");
						nav("/game-center/main");
					}}
				>
					Cancel
				</button>
				<div className="flex flex-col items-center flex-1">
					<span className="text-xl font-bold text-crypto-text">Daily Check-in</span>
					<span className="text-sm text-crypto-cyan">@{user?.nickname}</span>
				</div>
				<div className="w-[80px] flex justify-end">
					<CryptoButton
						disabled={post.trim() === "" || posting}
						onClick={() => sendPost()}
						size="sm"
					>
						{posting ? "..." : "Post"}
					</CryptoButton>
				</div>
			</div>
		</div>

		<div className="w-full h-full flex flex-col items-center gap-2 min-h-[150px] max-h-[calc(30vh)] z-10 px-4 mt-4">
			<textarea
				className="w-full h-full p-4 rounded-xl resize-none outline-none transition-all
					bg-crypto-card text-crypto-text border border-white/5 
					placeholder:text-crypto-muted
					focus:border-crypto-cyan/50 focus:shadow-[0_0_15px_rgba(0,255,242,0.1)]"
				placeholder="What's on your mind?"
				value={post}
				onChange={(e) => setPost(e.target.value)}
			/>
		</div>
		<div className="w-full flex items-start gap-2 mt-4 justify-between px-6 z-10">
			<AddLocation onLocationChanged={l => {
				setLocation(l);
			}} />
			{/* <FishSelect onChange={(f) => {
				setFish(f);
			}} /> */}
		</div>
		{/* Decorative Glow */}
		<div className="fixed top-0 left-0 w-full h-[300px] bg-crypto-cyan/10 blur-[100px] pointer-events-none" />
	</div>;
}