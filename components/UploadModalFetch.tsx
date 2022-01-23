import * as Antd from 'antd';
import React from 'react';

import StdResponse from '../misc/std_response';

export interface UploadModalProps
{
    show: boolean;
    onHide?: () => void;
    onUploadCompleted?: () => void;
}

export default function UploadModal(props: UploadModalProps)
{
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

        const MAX_CHUNK = 16 * 1024 * 1024;
        const partCount = Math.ceil(file.size / MAX_CHUNK);

        let response: Response;
        let body: StdResponse;

        //File { name: "c1133068sample21.jpg", lastModified: 1624366728319, webkitRelativePath: "", size: 672626, type: "image/jpeg" }

        response = await fetch('/api/upload/create',
        {
            method: 'POST',
            headers: new Headers({
                'x-filename': file.name,
                'x-size': file.size.toString(),
                'x-content-type': file.type,
            }),
            credentials: 'omit',
            mode: 'same-origin',
            redirect: 'follow',
            cache: 'no-cache',
        });
        body = await response.json();
        if(!body.ok)
        {
            alert(body.message);
            setUploading(false);
            return;
        }
        
        const key = body.message!;

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

        let allDone = true;
        for(let i = 0; i< partCount; i++)
        {
            let start = i * MAX_CHUNK;
            let end = Math.min(file.size, (i + 1) * MAX_CHUNK);
            let sliced = file.slice(start, end);
            try
            {
                let part = await load(sliced);
                response = await fetch('/api/upload/chunk',
                {
                    method: 'POST',
                    body: part,
                    headers: new Headers({
                        'x-key': key,
                        'x-start': start.toString(),
                        'x-end': end.toString(),
                    }),
                    credentials: 'omit',
                    mode: 'same-origin',
                    redirect: 'follow',
                    cache: 'no-cache',
                });
                body = await response.json();
                if(!body.ok)
                {
                    throw new Error(body.message);
                }
                setUploadProgress(Number.parseFloat(((end / file.size) * 100).toFixed(2)));
            }
            catch($e)
            {
                allDone = false;
                alert($e);
                break;
            }
        }

        if(!allDone)
        {
            setUploading(false);
            return;
        }

        response = await fetch('/api/upload/finalise',
        {
            method: 'POST',
            headers: new Headers({
                'x-key': key,
            }),
            credentials: 'omit',
            mode: 'same-origin',
            redirect: 'follow',
            cache: 'no-cache',
        });
        body = await response.json();
        if(!body.ok)
        {
            alert(body.message);
            setUploading(false);
            return;
        }

        props.onHide && props.onHide();
        props.onUploadCompleted && props.onUploadCompleted();
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

