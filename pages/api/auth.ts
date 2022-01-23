// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jsonwebtoken from 'jsonwebtoken';

import StdResponse from '../../misc/std_response';

let INCORRECT_IP_COUNT = new Array<string>();

export default function handler(req: NextApiRequest, res: NextApiResponse<StdResponse>) 
{
    if(!req.headers['_IP'])
    {
        res.status(403).end();
        return;
    }

    const ip = req.headers['_IP'] as string;
    if(INCORRECT_IP_COUNT.filter(t => t === ip).length >= 5)
    {
        res.status(200).json({ ok: false, message: 'Login disabled', });
        return;
    }

    if(process.env.HS_USERNAME != undefined && process.env.HS_PASSWORD != undefined && req.body.username == process.env.HS_USERNAME && req.body.password == process.env.HS_PASSWORD)
    {
        let jwt = jsonwebtoken.sign({}, process.env.HS_KEY!);
        res.status(200).json({ ok: true, message: jwt, });
        return;
    }

    INCORRECT_IP_COUNT.push(ip);
    res.status(200).json({ ok: false, message: 'Login incorrect', });
}
