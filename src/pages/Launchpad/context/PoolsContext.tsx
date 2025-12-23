import React, { createContext, FC, ReactNode, useContext, useState } from 'react';
import { ALL_POOLS, PoolData } from '../data/pools';

export interface PoolsContextType {
	upcomingPools: {
		data: PoolData[];
		setData: React.Dispatch<React.SetStateAction<PoolData[]>>;
	};
	featuredPools: {
		data: PoolData[];
		setData: React.Dispatch<React.SetStateAction<PoolData[]>>;
	};
}

const PoolsContext = createContext<PoolsContextType | undefined>(undefined);

export const PoolsProvider: FC<{ children: ReactNode }> = ({ children }) => {
	// Split pools into featured (started) and upcoming (not started)
	const now = Date.now();
	const startedPools = ALL_POOLS.filter(pool => pool.startTime <= now);
	const notStartedPools = ALL_POOLS.filter(pool => pool.startTime > now);

	const initialFeatured = startedPools;
	// Sort upcoming pools by start time (ascending)
	const initialUpcoming = notStartedPools.sort((a, b) => a.startTime - b.startTime);

	const [upcomingPools, setUpcomingPools] = useState<PoolData[]>(initialUpcoming);
	const [featuredPools, setFeaturedPools] = useState<PoolData[]>(initialFeatured);

	return (
		<PoolsContext.Provider
			value={{
				upcomingPools: { data: upcomingPools, setData: setUpcomingPools },
				featuredPools: { data: featuredPools, setData: setFeaturedPools },
			}}
		>
			{children}
		</PoolsContext.Provider>
	);
};

export const useComingData = () => {
	const context = useContext(PoolsContext);
	if (!context) throw new Error('useComingData must be used within PoolsProvider');
	return context.upcomingPools;
};

export const useFeaturedPoolData = () => {
	const context = useContext(PoolsContext);
	if (!context) throw new Error('useFeaturedPoolData must be used within PoolsProvider');
	return context.featuredPools;
};
