import { Moment } from 'moment';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface SharePolicy
{
    password?: string;
    expireAfter?: number;
}

export interface FileRecord
{
    key: string;
    md5: string;
    filename: string;
    size: number;
    contentType: string;
    downloaded: number;

    sharePolicy?: SharePolicy;
}

const __dirname = path.resolve(path.dirname('')); 

export function listAllKeys(): string[]
{
    const regex = /([a-zA-Z0-9]+)\.meta\.json$/;

    const dirPath = path.join(__dirname, 'upload');
    let files = fs.readdirSync(dirPath); 
    files = files.filter(t => regex.test(t));
    files = files.map(t => regex.exec(t)![1]);

    return files;
}

export function getAllFileRecords(): FileRecord[]
{
    let keys = listAllKeys();
    let metas = keys.map(getFileRecordByKey);
    return metas.filter(t => t) as FileRecord[];
}

export function getFileRecordByKey(key: string): FileRecord | undefined
{
    const file = path.join(__dirname, 'upload', `${key}.meta.json`);
    const meta = fs.readFileSync(file);
    if(!meta)
    {
        return undefined;
    }

    return JSON.parse(meta.toString());
}

export function saveFileRecord(key:string, fileRecord: FileRecord)
{
    const file = path.join(__dirname, 'upload', `${key}.meta.json`);
    fs.writeFileSync(file, JSON.stringify(fileRecord));
}

export function openReadStream(key: string): fs.ReadStream | undefined
{
    const file = path.join(__dirname, 'upload', `${key}.bin`);
    return fs.createReadStream(file);
}

export function unlink(key: string)
{
    const file = path.join(__dirname, 'upload', `${key}.bin`);
    const meta = path.join(__dirname, 'upload', `${key}.meta.json`);

    if(fs.existsSync(file))
    {
        fs.unlinkSync(file);
    }
    if(fs.existsSync(meta))
    {
        fs.unlinkSync(meta);
    }
}

(function()
{
    const dirPath = path.join(__dirname, 'upload');
    fs.mkdirSync(dirPath, {
        recursive: true,
    });
}());