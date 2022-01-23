import * as Antd from 'antd';
import React from 'react';
import { io } from 'socket.io-client';
import { promisify } from 'util';

import StdResponse from '../misc/std_response';
import TokenContext from '../misc/token_context';

export interface UploadModalProps
{
    show: boolean;
    onHide?: () => void;
    onUploadCompleted?: () => void;
}

export default function UploadModal(props: UploadModalProps)
{
    const {token} = React.useContext(TokenContext);
    const [uploading, setUploading] = React.useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = React.useState<number>(0);

    const handleFileChange = async function(event: React.ChangeEvent<HTMLInputElement>)
    {
        if(!event.target.files || event.target.files.length <= 0)
        {
            return;
        }
        const files = event.target.files;
        const file = files[0];
        event.target.value = '';

        setUploading(true);
        setUploadProgress(0);

        const MAX_CHUNK = 1 * 1024 * 1024;
        const partCount = Math.ceil(file.size / MAX_CHUNK);

        let response: Response;
        let body: StdResponse;

        //File { name: "c1133068sample21.jpg", lastModified: 1624366728319, webkitRelativePath: "", size: 672626, type: "image/jpeg" }

        const load = function(blob: Blob)
        {
            const fr = new FileReader();
            const ret = new Promise<Blob>(($O, $X) =>
            {
                fr.onload = (event: ProgressEvent) =>
                {
                    const ab = fr.result as ArrayBuffer;
                    $O(new Blob([new Uint8Array(ab, 0, ab.byteLength)]));
                };
                fr.onerror = (event: ProgressEvent) =>
                {
                    $X(fr.error);
                };
            });
            fr.readAsArrayBuffer(blob);
            return ret;
        };

        let key: string = '';
        
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,
        {
            forceNew: true,
            closeOnBeforeunload: true,
            reconnection: false,
        });
        socket.on('chunk', async function(seq:number)
        {
            //console.log('ws chunk', seq);

            let start = seq * MAX_CHUNK;
            let end = Math.min(file.size, (seq + 1) * MAX_CHUNK);
            let sliced = file.slice(start, end);
            let chunk = await load(sliced);
            socket.emit('chunk', seq, chunk);
            
            setUploadProgress(Number.parseFloat(((start / file.size) * 100).toFixed(2)));
        });
        socket.on('end', function(_key:string)
        {
            //console.log('ws end', _key);

            setUploadProgress(100);
            key = _key;
        });
        socket.on('error', function(message:string)
        {
            console.log('ws error', message);

            alert(message);
        });
        socket.emit('hello', token!, file.name, file.size, file.type);

        await new Promise<void>($O =>
        {
            socket.once('disconnect', function(reason: string)
            {
                //console.log('ws disconnect', reason);
                socket.close();
                $O();
            });
        });

        await new Promise<void>($O =>
        {
            setTimeout(() => $O(), 1000);
        });

        setUploading(false);
        if(key !== '')
        {
            props.onHide && props.onHide();
            props.onUploadCompleted && props.onUploadCompleted();
        }
    }

    return (
        <Antd.Modal 
            title="Upload file" 
            visible={props.show} 
            footer={<Antd.Button onClick={props.onHide} 
            disabled={uploading}>Cancel</Antd.Button>} 
            closable={false} 
        >
            <Antd.Typography.Title>File</Antd.Typography.Title>
            <Antd.Typography.Paragraph>
                {!uploading ? 
                    <input type="file" onChange={handleFileChange} />
                :
                    <Antd.Progress type="circle" percent={uploadProgress} />
                }
            </Antd.Typography.Paragraph>
        </Antd.Modal>
    );
}

