import React from 'react';
import * as Antd from 'antd';
import ErrorPage from 'next/error';
import { NextPageContext } from 'next';
import Head from 'next/head';

import * as FileMemory from '../misc/file_memory';

export interface AskPasswordProps
{
    k: string;
    fileRecord: FileMemory.FileRecord | undefined;
    incorrectPasssword?: number;
}

export async function getServerSideProps(context: NextPageContext)
{
    const key = context.query.k as string | undefined;

    if(!key)
    {
        return {props: {}};
    }

    if(!FileMemory)
    {
        return {props: {}};
    }

    let fr = FileMemory.getFileRecordByKey(key);
    if(!fr)
    {
        return {props: {}};
    }

    if(fr.sharePolicy && !fr.sharePolicy.password)
    {
        return {props: {}};
    }

    fr = Object.assign({}, fr);
    delete fr.sharePolicy;

    return {
        props: 
        {
            k: key,
            fileRecord: fr,
            incorrectPasssword: context.query.incorrectPasssword ? context.query.incorrectPasssword : null,
        },
    }
}
  

export default function AskPassword(props: AskPasswordProps)
{
    const key = props.k;

    const [password, setPassword] = React.useState<string>('');
    const form = React.useRef<HTMLFormElement>(null);

    const fr = props.fileRecord;
    if(!fr)
    {
        return <ErrorPage statusCode={404}/>;
    }

    const handleKeyup = function(event: React.KeyboardEvent)
    {
        if(event.key === 'Enter')
        {
            handleDownloadClick();
        }
    }

    const handleDownloadClick = function()
    {
        if(password === '')
        {
            return;
        }

        //location.href = `/d${key}?password=${password}`;
        if(form.current)
        {
            form.current.submit();
        }
    }

    return (
        <div>
            <Head>
                <title>{process.env.NEXT_PUBLIC_TITLE}</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Download password</h1>
            {props.incorrectPasssword ?
            (
                <p>
                    <Antd.Alert type="error" message="Incorrect password" />
                </p>
            ): null}
            <p>
                <Antd.Input value={password} onChange={$e => setPassword($e.target.value)} onKeyUp={handleKeyup} />
            </p>
            <p>
                <Antd.Button onClick={handleDownloadClick}>Download</Antd.Button>
            </p>

            <form ref={form} method="POST" action={`/d${key}`}>
                <input type="hidden" name="password" value={password} />
            </form>
        </div>
    )
}