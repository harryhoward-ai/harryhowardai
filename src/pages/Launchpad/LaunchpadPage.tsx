import { FC } from 'react';
import { PoolList } from './components/PoolList';
import { Header } from './components/Header';
import { PoolsProvider } from './context/PoolsContext';
import { FeaturedPoolSection } from './components/FeaturedPoolSection';

export const LaunchpadPage: FC = () => {
	return (
		<PoolsProvider>
			<div className="min-h-screen w-full bg-crypto-bg text-crypto-text pb-24">
				<Header />

				<div className="px-5 space-y-8 mt-2">
					{/* Featured Section */}
					<section>
						<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
							Featured Pool
							<span className="w-1.5 h-1.5 rounded-full bg-defi-accent-blue" />
						</h2>
						<FeaturedPoolSection />
					</section>

					{/* Upcoming Section */}
					<section>
						<h2 className="text-lg font-bold mb-4">Upcoming Pools</h2>
						<PoolList />
					</section>
				</div>

				{/* Decorative Glow */}
				<div className="fixed top-0 left-0 w-full h-[300px] bg-crypto-cyan/10 blur-[100px] pointer-events-none" />
			</div>
		</PoolsProvider>
	);
};

export default LaunchpadPage;
