// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import * as FileMemory from '../../misc/file_memory';
import StdResponse from '../../misc/std_response';

interface RequestData
{
    key: string;
    sharePolicy: FileMemory.SharePolicy;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<StdResponse>) 
{
    const { key } = req.body;
    
    if(typeof(key) !== 'string')
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    let fr = FileMemory.getFileRecordByKey(key);
    if(fr === undefined)
    {
        res.json({ok: false, message: 'Key not found'});
        return;
    }

    let request = req.body as RequestData;
    fr.sharePolicy = request.sharePolicy;

    FileMemory.saveFileRecord(key, fr);
    res.json({ok: true});
}
