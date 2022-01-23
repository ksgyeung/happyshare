import React from 'react';
import * as Antd from 'antd';
import moment, { Moment } from 'moment';
import Randomstring from 'randomstring';

import TokenContext from '../misc/token_context';
import StdResponse from '../misc/std_response';
import Loading from './Loading';

export interface LoginProps
{
    children: JSX.Element,
}

export default function Login(props: LoginProps)
{
    const tokenContext = React.useContext(TokenContext);
    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [showLoading, setShowLoading] = React.useState<boolean>(false);

    const handleLogin = async function()
    {
        setUsername('');
        setPassword('');
        setShowLoading(true);

        let response = await fetch('/api/auth',
        {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: new Headers({
                'content-type': 'application/json',
            }),
            mode: 'same-origin',
        });
        let body = await response.json() as StdResponse;

        setShowLoading(false);

        if(!body.ok)
        {
            alert(body.message!);
            return;
        }

        tokenContext.setToken(body.message!);
    }

    const handleKeyUp = function(event: React.KeyboardEvent)
    {
        if(event.key === 'Enter')
        {
            handleLogin();
        }
    }

    if(tokenContext.token == null)
    {
        return (
            <>
                {showLoading ? <Loading /> : null}
                <Antd.Row>
                    <Antd.Col span={8}>&nbsp;</Antd.Col>
                    <Antd.Col span={8}>&nbsp;</Antd.Col>
                    <Antd.Col span={8}>
                        <Antd.Card style={{ width: 300 }}>
                            <p>
                                <div>Username</div>
                                <div><Antd.Input value={username} onChange={$e => setUsername($e.target.value)} onKeyUp={handleKeyUp} /></div>
                            </p>
                            <p>
                                <div>Password</div>
                                <div><Antd.Input.Password value={password} onChange={$e => setPassword($e.target.value)} onKeyUp={handleKeyUp} /></div>
                            </p>
                            <p>&nbsp;</p>
                            <p><Antd.Button onClick={handleLogin}>Login</Antd.Button></p>
                        </Antd.Card>
                    </Antd.Col>
                </Antd.Row>
            </>
        );
    }

    return props.children;
}