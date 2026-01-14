import { FC, ButtonHTMLAttributes } from "react";


interface CryptoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	icon?: React.ReactNode;
	loading?: boolean;
}

export const CryptoButton: FC<CryptoButtonProps> = ({
	children,
	className,
	variant = "primary",
	size = "md",
	fullWidth = false,
	icon,
	loading = false,
	...props
}) => {
	const baseStyles = "font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const sizeStyles = {
		sm: "py-2 px-4 text-sm",
		md: "py-3.5 px-6 text-base",
		lg: "py-4 px-8 text-lg",
	};

	const variantStyles = {
		primary: "bg-gradient-to-r from-crypto-cyan to-crypto-purple text-white hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]",
		secondary: "bg-crypto-card border border-white/10 text-crypto-text hover:bg-white/5",
	};

	return (
		<button
			className={`
				${baseStyles}
				${sizeStyles[size]}
				${variantStyles[variant]}
				${fullWidth ? "w-full" : ""}
				${className || ""}
			`}
			disabled={loading || props.disabled}
			{...props}
		>
			{loading ? (
				<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
			) : (
				<>
					{children}
					{icon}
				</>
			)}
		</button>
	);
};
