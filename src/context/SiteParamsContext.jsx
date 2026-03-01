import { createContext, useContext, useEffect, useState } from 'react';
import { fetchParametros } from '../api';

const SiteParamsContext = createContext({});

export function SiteParamsProvider({ children }) {
    const [params, setParams] = useState({});

    useEffect(() => {
        fetchParametros().then(setParams).catch(() => { });
    }, []);

    return (
        <SiteParamsContext.Provider value={params}>
            {children}
        </SiteParamsContext.Provider>
    );
}

export function useSiteParams() {
    return useContext(SiteParamsContext);
}
