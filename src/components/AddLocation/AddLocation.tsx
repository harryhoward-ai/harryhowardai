import { FC, useEffect, useState } from "react";
import { useLocationCity } from "./useLocationCity";
import { CircleX, MapPin, MapPinCheck } from "lucide-react";

interface AddLocationProps {
	onLocationChanged?: (location: string) => void;
}

const AddLocation: FC<AddLocationProps> = ({ onLocationChanged }) => {
	const { locate } = useLocationCity(false);
	const [location, setLocation] = useState("")

	const handleGetLocation = async () => {
		try {
			const info = await locate();
			console.log("Location data:", info);
			if (info != null) {
				setLocation(`${info.state}, ${info.country}`)
			} else {
				setLocation("");
			}
		} catch (e) {
			console.error("Failed to get location", e);
		}
	};

	const clearLocation = () => {
		setLocation("");
	}

	useEffect(() => {
		if (onLocationChanged) {
			onLocationChanged(location);
		}
	}, [location, onLocationChanged]);

	return (
		<div className="flex flex-col items-center justify-center h-full bg-crypto-card border border-white/10 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:border-crypto-cyan/30 transition-colors">
			{location == "" ? (
				<div onClick={handleGetLocation} className="flex items-center cursor-pointer group">
					<MapPin size={16} className="mr-2 text-crypto-cyan" />
					<span className="text-sm font-medium text-crypto-text group-hover:text-crypto-cyan transition-colors">
						Add location
					</span>
				</div>
			) : (
				<div className="flex items-center">
					<MapPinCheck size={16} className="mr-2 text-crypto-cyan" />
					<span className="text-sm font-medium text-crypto-text">
						{location}
					</span>
					<div onClick={clearLocation} className="ml-2 p-0.5 rounded-full hover:bg-white/10 cursor-pointer transition-colors">
						<CircleX size={16} className="text-crypto-muted hover:text-red-400 transition-colors" />
					</div>
				</div>
			)}
		</div>
	);
}

export default AddLocation;