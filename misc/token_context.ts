import React from 'react';

export interface TokenContextProp
{
    token: string | null;
    setToken: (token:string | null) => void;
}

const TokenContext = React.createContext<TokenContextProp>({token: null, setToken: t => {}});

export default TokenContext;
