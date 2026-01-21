
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { AppKitNetwork, bsc, bscTestnet } from '@reown/appkit/networks'
import { useAppKit } from "@reown/appkit/react";
import { FC } from 'react';
import { Env, getEnv } from '@/utils/Api';

// 1. Get projectId
const projectId = '8e4276d4bb194be92293390a165e0937';

// 2. Set the networks

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc];

if (getEnv() != Env.Prod) {
	networks.push(bscTestnet);
}

// 3. Create a metadata object - optional
const metadata = {
	name: 'HarryHowardAI',
	description: 'Launchpad',
	url: window.location.origin, // origin must match your domain & subdomain
	icons: ['https://res.harryhowardai.com/icons/howardai-icon-512.png']
}

// 4. Create a AppKit instance
createAppKit({
	adapters: [new EthersAdapter()],
	networks,
	metadata,
	projectId,
	features: {
		analytics: true // Optional - defaults to your Cloud configuration
	}
})

const ConnectButton: FC = () => {
	// 4. Use modal hook
	const { open } = useAppKit();
	return <>
		<button onClick={() => open()}>Open Connect Modal</button>
		<button onClick={() => open({ view: "Networks" })}>
			Open Network Modal
		</button>
	</>
}

export default ConnectButton;