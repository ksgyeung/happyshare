/*
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Randomstring from 'randomstring';
import crypto from 'crypto';

import { FileMemory, FileRecord } from '../../../misc/file_memory';
import StdResponse from '../../../misc/std_response';
import { EventEmitter } from 'stream';

export const config = 
{
    api: 
    {
        bodyParser: false,
    }
};

async function handleCreate(req: NextApiRequest, res: NextApiResponse<StdResponse>)
{
    let filename = req.headers['x-filename'] as string;
    let size = Number.parseInt(req.headers['x-size'] as string);
    let contentType = req.headers['x-content-type'] as string;

    if(typeof(filename) !== 'string' || size <= 0 || typeof(contentType) !== 'string')
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    const key = Randomstring.generate({
        length: 8,
        charset: 'alphanumeric',
    });
    let fr: FileRecord = 
    {
        key,
        md5: '00000000000000000000000000000000',
        md5_internal: crypto.createHash('md5'),
        filename,
        size: size,
        buffer: Buffer.alloc(size),
        contentType,
        downloaded: 0,
    }
    FileMemory.set(key, fr);

    res.json({ok: true, message: key});
}

async function handleFile(req: NextApiRequest, res: NextApiResponse<StdResponse>)
{
    let key = req.headers['x-key'] as string;
    let start = Number.parseInt(req.headers['x-start'] as string);
    let end = Number.parseInt(req.headers['x-end'] as string);

    if(typeof(key) !== 'string' || start < 0 || end <= 0 || end <= start)
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    if(16 * 1024 * 1024 < end - start)
    {
        res.json({ok: false, message: 'Chunk too large'});
        return;
    }

    let fr = FileMemory.get(key);
    if(fr === undefined)
    {
        res.json({ok: false, message: 'Key not found'});
        return;
    }

    let event = new EventEmitter();

    let chunks: Buffer[] = [];
    req.on('data', function(chunk: Buffer)
    {
        chunks.push(chunk);
        fr!.md5_internal!.update(chunk);
    });
    req.on('end', function()
    {
        let concat = Buffer.concat(chunks);
        concat.copy(fr!.buffer!, start, 0, concat.length);
        res.json({ok: true});
        event.emit('done');
    });
    req.on('error', function()
    {
        res.json({ok: false, message: 'error while reading file'});
        event.emit('done');
    });

    await new Promise<void>($O => event.once('done', () => $O()));
}

async function handleFinalise(req: NextApiRequest, res: NextApiResponse<StdResponse>)
{
    let key = req.headers['x-key'] as string;

    if(typeof(key) !== 'string')
    {
        res.json({ok: false, message: 'Incorrect parameters'});
        return;
    }

    let fr = FileMemory.get(key);
    if(fr === undefined)
    {
        res.json({ok: false, message: 'Key not found'});
        return;
    }

    fr.md5 = fr.md5_internal!.digest('hex');
    delete fr.md5_internal;
    res.json({ok: true});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<StdResponse>): Promise<void>
{
    const {action} = req.query;

    if(req.method !== 'POST')
    {
        res.status(405);
        return;
    }
    switch(action)
    {
        case 'create':
            await handleCreate(req, res);
            break;
        case 'chunk':
            await handleFile(req, res);
            break;
        case 'finalise':
            await handleFinalise(req, res);
            break;
        default:
            res.json({ok: false, message: 'Action now allow'});
    }
}
*/

export default function AAA()
{
    return null;
}