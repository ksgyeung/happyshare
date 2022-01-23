import React from 'react';
import type { AppProps } from 'next/app'
import * as Antd from 'antd';
import 'antd/dist/antd.css';

import '../styles/globals.css';
import style from '../styles/_app.module.css';
import TokenContext from '../misc/token_context';

function MyApp({ Component, pageProps }: AppProps) 
{
    const [token, setToken] = React.useState<null | string>(null);

    return (
        <TokenContext.Provider value={{token, setToken}}>
            <Antd.Layout>
                <Antd.Layout.Header>
                    <div className={style.title}>{process.env.NEXT_PUBLIC_TITLE}</div>
                </Antd.Layout.Header>
                <Antd.Layout.Content>
                    <div className={style.content}>
                        <Component {...pageProps} />
                    </div>
                </Antd.Layout.Content>
            </Antd.Layout>
        </TokenContext.Provider>
    )
}

export default MyApp
