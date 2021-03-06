import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import React from 'react';
import * as Antd from 'antd';
import * as I from '@ant-design/icons';
import dynamic from 'next/dynamic';

import Login from '../components/Login';
const Management = dynamic(() => import('./management'));


const Home: NextPage = () => 
{
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_TITLE}</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Login>
                <Management />
            </Login>
        </>
    );
}

export default Home;
