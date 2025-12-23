import { FC } from 'react';
import { FeaturedPoolCard } from './FeaturedPoolCard';
import { useFeaturedPoolData } from '../context/PoolsContext';

export const FeaturedPoolSection: FC = () => {
	const { data: featuredPools } = useFeaturedPoolData();

	if (!featuredPools || featuredPools.length === 0) return null;

	return (
		<div className="flex flex-col gap-4 px-4 pb-4">
			{featuredPools.map((pool) => (
				<div key={pool.id} className="w-full">
					<FeaturedPoolCard
						id={pool.id}
						name={pool.name}
						ticker={pool.ticker}
						chain={pool.chain}
						price={pool.price}
						raised={pool.raised ?? 0}
						target={pool.target ?? 0}
						participants={pool.participants ?? 0}
					/>
				</div>
			))}
		</div>
	);
};
