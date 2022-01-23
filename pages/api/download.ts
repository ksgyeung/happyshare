// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

import * as FileMemory from '../../misc/file_memory';
import StdResponse from '../../misc/std_response';

export default function handler(req: NextApiRequest, res: NextApiResponse) 
{
    const key = req.query.k;
    const password = req.query.password || req.body.password;

    if(typeof(key) !== 'string')
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    let fr = FileMemory.getFileRecordByKey(key);
    if(fr === undefined)
    {
        res.redirect('/404');
        return;
    }

    if(fr.sharePolicy && fr.sharePolicy.expireAfter && moment().isSameOrAfter(fr.sharePolicy.expireAfter))
    {
        res.redirect(`/404`);
        return;
    }

    if(fr.sharePolicy && fr.sharePolicy.password && (password === undefined || password == ''))
    {
        res.redirect(`/p${key}`);
        return;
    }
    
    if(fr.sharePolicy && fr.sharePolicy.password && fr.sharePolicy.password !== password)
    {
        res.redirect(`/p${key}?incorrectPasssword=1`);
        return;
    }

    let stream = FileMemory.openReadStream(key);
    if(!stream)
    {
        res.redirect(`/404`);
        return;
    }

    res.setHeader('Content-Type', fr.contentType);
    res.setHeader('Content-Transfer-Encoding', 'Binary');
    res.setHeader('Content-disposition', `attachment; filename="${fr.filename}"`);
    res.setHeader('Content-Length', fr.size.toString());
    stream.pipe(res);
}
