import { useForm } from 'antd/lib/form/Form';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';

function response403()
{
    return new Response(null, {
        status: 403,
    });
}

function middleware1(req: NextRequest, ev: NextFetchEvent) 
{
    console.log('bbbb');
    let pathname = req.nextUrl.pathname;
    if(pathname !== '/api/auth')
    {
        // we not interest other api
        return NextResponse.next();
    }

    const ip = req.ip;
    console.log(ip);
    if(!ip)
    {
        // block unknown ip
        return NextResponse.error();
    }
    req.headers.set('_IP', ip);
    return NextResponse.next();
}


function middleware2(req: NextRequest, ev: NextFetchEvent) 
{
    console.log('ccccc');
    const whitelist = ['/api/auth', '/api/download'];
    if(whitelist.includes(req.nextUrl.pathname))
    {
        return NextResponse.next();
    }

    let auth = req.headers.get('authentication');
    if(!auth)
    {
        return response403();
    }

    if(!auth.startsWith('Bearer '))
    {
        return response403();
    }

    auth = auth.substring('Bearer '.length);
    let jwt;
    try
    {
        jwt = jsonwebtoken.verify(auth, process.env.HS_KEY!);
    }
    catch($e)
    {
        return response403();
    }

    return NextResponse.next();
}

export function middleware(req: NextRequest, ev: NextFetchEvent)
{
    const whitelist = ['/api/auth', '/api/download'];
    if(whitelist.includes(req.nextUrl.pathname))
    {
        return NextResponse.next();
    }

    let auth = req.headers.get('authentication');
    if(!auth)
    {
        return response403();
    }

    if(!auth.startsWith('Bearer '))
    {
        return response403();
    }

    auth = auth.substring('Bearer '.length);
    let jwt;
    try
    {
        jwt = jsonwebtoken.verify(auth, process.env.HS_KEY!);
    }
    catch($e)
    {
        return response403();
    }

    return NextResponse.next();
}
