import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import * as SocketIO from 'socket.io';
import fs from 'fs';
import path from 'path';
import RandomString from 'randomstring';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import express from 'express';
import RequestIP from 'request-ip';

async function main()
{
    process.on('uncaughtExceptionMonitor', function(error, origin)
    {
        console.error(error, origin);
    });

    dotenv.config({
        override: false,
    });

    const host = process.env.HS_HOSTNAME;
    const port = Number.parseInt(process.env.HS_PORT);

    console.log('Generating HS_KEY');
    process.env.HS_KEY = RandomString.generate({
        length: '32',
        readable: false,
    });

    const production = (process.argv[2] && process.argv[2] == 'production') || process.env.NODE_ENV === 'production';
    console.log(`Starting ${!production ? 'dev' : 'production'} mode`);

    const expressApp = express();
    expressApp.set('trust proxy', true);

    const nextApp = next({ 
        dev: !production, 
        hostname: host, 
        port: port,
    });
    await nextApp.prepare();
    
    /*
    const httpServer = createServer((req, res) => 
    {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        //const { pathname, query } = parsedUrl;

        // if (pathname === '/a') {
        // app.render(req, res, '/a', query)
        // } else if (pathname === '/b') {
        // app.render(req, res, '/b', query)
        // } else {
        // handle(req, res, parsedUrl)
        // }

        handle(req, res, parsedUrl);
    });
    */

    const httpServer = createServer(expressApp);

    expressApp.use(function(req, res, enext)
    {
        const ip = RequestIP.getClientIp(req) || req.socket.remoteAddress;
        if(ip)
        {
            req.headers['_IP'] = ip;
        }
        enext();
    });
    expressApp.use(function(req, res, enext)
    {
        const parsedUrl = parse(req.url, true);
        nextApp.getRequestHandler()(req, res, parsedUrl);
    });

    const io = new SocketIO.Server(httpServer,
    {
        maxHttpBufferSize: 32 * 1024 * 1024,
        allowEIO3: true,
    });

    //await promisify(expressApp.listen)(port, host, 100);
    //console.log('HTTP server started');

    io.on('connection', socket => 
    {
        try
        {
            const key = RandomString.generate({
                length: 8,
            });
            const __dirname = path.resolve(path.dirname('')); 
            const dirPath = path.join(__dirname, 'upload');
            const filePath = path.join(dirPath, `${key}.bin`)
            const metaPath = path.join(dirPath, `${key}.meta.json`)
            let stream = null;
            let md5hash = crypto.createHash('md5');
            let chunkSeq = -1;
            let filename = null;
            let size = 0;
            let contentType = null;
            let written = 0;
            let verified = false;

            if(!fs.existsSync(dirPath))
            {
                fs.mkdirSync(dirPath, {
                    recursive: true,
                });
            }
            
            socket.on('disconnect', function(reason)
            {
                //console.log('ws disconnect', key, reason);

                if(stream)
                {
                    stream.close();
                }
                if(written != size)
                {
                    try
                    {
                        fs.unlinkSync(filePath);
                    }
                    catch($ee)
                    {}
                    try
                    {
                        fs.unlinkSync(metaPath);
                    }
                    catch($ee)
                    {}
                }
                else
                {
                    let meta = 
                    {
                        key,
                        filename,
                        size,
                        contentType,
                        md5: md5hash.digest('hex'),
                        downloaded: 0,
                    }
                    fs.writeFileSync(metaPath, JSON.stringify(meta));
                }
            });

            socket.on('hello', function(token, _filename, _size, _contentType)
            {
                //console.log('ws hello', key, _filename, _size, _contentType);
                
                if(!token)
                {
                    try
                    {
                        jsonwebtoken.verify(token, process.env.HS_KEY);
                        verified = true;
                    }
                    catch($e)
                    {
                        socket.disconnect(true);
                        return;
                    }
                }

                if(stream)
                {
                    socket.emit('error', 'Already hello');
                    socket.disconnect(true);
                    return;
                }

                if(filename == '' || _size <= 0 || _contentType == '')
                {
                    socket.emit('error', 'Parameters incorrect');
                    socket.disconnect(true);
                    return;
                }

                filename = _filename;
                size = _size;
                contentType = _contentType;

                stream = fs.createWriteStream(filePath);
                stream.once('open', function()
                {
                    chunkSeq = 0;
                    socket.emit('chunk', chunkSeq);
                });
            });

            socket.on('chunk', function(seq, chunk)
            {
                //console.log('ws chunk', key, seq, chunk.length);
                if(!stream)
                {
                    socket.emit('error', 'Not hello');
                    socket.disconnect(true);
                    return;
                }
                if(chunkSeq < 0)
                {
                    socket.emit('error', 'Seq is incorrect');
                    socket.disconnect(true);
                    return;
                }
                if(seq != chunkSeq)
                {
                    socket.emit('chunk', chunkSeq);
                    return;
                }
                md5hash.update(chunk);
                stream.write(chunk, () => 
                {
                    written += chunk.length;

                    if(written == size)
                    {
                        socket.emit('end', key);
                        socket.disconnect(true);
                        return;
                    }
                    if(written > size)
                    {
                        socket.emit('error', 'size mismatch');
                        socket.disconnect(true);
                        return;
                    }

                    chunkSeq++;
                    socket.emit('chunk', chunkSeq);
                });
            });

            socket.on('error', () =>
            {
                socket.emit('error', 'Server error');
                socket.disconnect(true);
            });

            socket.on('ping', () =>
            {
                console.log('ping!!!');
                socket.emit('pong');
            });
        }
        catch($e)
        {
            console.error($e);
            socket.emit('error', 'Server error');
            socket.disconnect(true);
        }
    });
    
    await new Promise($O =>
    {
        httpServer.listen(port, host, 100, () => $O());
    });
    console.log('HTTP server started');
}

main();
