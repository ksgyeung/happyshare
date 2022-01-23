// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import * as FileMemory from '../../misc/file_memory';

export default async function handler(req: NextApiRequest, res: NextApiResponse<FileMemory.FileRecord[]>) 
{
    let frs = FileMemory.getAllFileRecords();
    res.json(frs);
}
