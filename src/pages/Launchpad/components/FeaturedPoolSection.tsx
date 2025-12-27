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
						pool={pool}
					/>
				</div>
			))}
		</div>
	);
};
