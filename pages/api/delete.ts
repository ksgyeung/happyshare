// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import * as FileMemory from '../../misc/file_memory';
import StdResponse from '../../misc/std_response';

export default function handler(req: NextApiRequest, res: NextApiResponse<StdResponse>) 
{
    const {key} = req.body;

    if(typeof(key) !== 'string')
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    FileMemory.unlink(key);
    res.json({ok: true});
}
