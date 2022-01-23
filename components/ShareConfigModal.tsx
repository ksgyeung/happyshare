import React from 'react';
import * as Antd from 'antd';
import moment, { Moment } from 'moment';
import Randomstring from 'randomstring';

import { FileRecord, SharePolicy } from '../misc/file_memory';
import StdResponse from '../misc/std_response';
import TokenContext from '../misc/token_context';

export interface ShareConfigModalProps
{
    show: boolean;
    fileRecord?: FileRecord;
    
    onHide?: () => void;
    onSetFileRecord?: (fileRecord: FileRecord) => void;
}

export default function ShareConfigModal(props: ShareConfigModalProps)
{
    const host = process.env.NEXT_PUBLIC_HOST_URL;
    const {token} = React.useContext(TokenContext);
    const [password, setPassword] = React.useState<false | string>(props.fileRecord && props.fileRecord.sharePolicy && props.fileRecord.sharePolicy.password ? props.fileRecord.sharePolicy.password : false);
    const [expire, setExpire] = React.useState<false | Moment>(props.fileRecord && props.fileRecord.sharePolicy && props.fileRecord.sharePolicy.expireAfter ? moment(props.fileRecord.sharePolicy.expireAfter) : false);

    if(!props.fileRecord)
    {
        return null;
    }

    const handleOkClick = async function(event: React.MouseEvent)
    {
        let n = Object.assign({}, props.fileRecord!);
        n.sharePolicy = n.sharePolicy || {};
        if(password)
        {
            n.sharePolicy.password = password;
        }
        if(expire)
        {
            n.sharePolicy.expireAfter = expire.unix();
        }

        let response = await fetch('/api/share',
        {
            method: 'POST',
            body: JSON.stringify({key: n.key,sharePolicy: n.sharePolicy}),
            mode: 'same-origin',
            headers: new Headers({
                'content-type': 'application/json',
                'authentication': `Bearer ${token!}`,
            }),
        });
        let body: StdResponse = await response.json();
        if(!body.ok)
        {
            alert(body.message!);
            return;
        }

        props.onSetFileRecord && props.onSetFileRecord(n);
        props.onHide && props.onHide();
    }

    const handlePasswordOptionChange = function(enable: number)
    {
        if(enable)
        {
            let random = Randomstring.generate({
                charset: 'number',
                length: 4
            });
            setPassword(random);
        }
        else
        {
            setPassword(false);
        }
    }

    const handlePasswordChange = function(password: string)
    {
        setPassword(password);
    }

    const handleExpireOptionChange = function(enable: number)
    {
        if(enable)
        {
            let exp = moment().add('3d');
            setExpire(exp);
        }
        else
        {
            setPassword(false);
        }
    }
    
    const handleExpireChange = function(m: Moment | null, text: string)
    {
        if(!m)
        {
            return;
        }

        setExpire(m);
    }

    return (
        <Antd.Modal title="Share option" visible={props.show} onCancel={() => props.onHide && props.onHide()} onOk={handleOkClick}>
            <Antd.Typography.Title>Share url</Antd.Typography.Title>
            <Antd.Typography.Paragraph>
                <Antd.Input readOnly={true} value={`${host}/d${props.fileRecord.key}`} />
            </Antd.Typography.Paragraph>
            <Antd.Typography.Title>Password protected</Antd.Typography.Title>
            <Antd.Typography.Paragraph>
                <Antd.Space direction="vertical">
                    <div>
                        <Antd.Radio.Group value={password === false ? 0 : 1} onChange={e => handlePasswordOptionChange(e.target.value)}>
                            <Antd.Radio value={0}>No</Antd.Radio>
                            <Antd.Radio value={1}>Yes</Antd.Radio>
                        </Antd.Radio.Group>
                    </div>
                    {password ? 
                        <div>
                            <Antd.Input placeholder="Password" value={password ? password : ''} onChange={$e => handlePasswordChange($e.target.value)} />
                        </div>
                    : null}
                </Antd.Space>
            </Antd.Typography.Paragraph>
            <Antd.Typography.Title>Expire after</Antd.Typography.Title>
            <Antd.Typography.Paragraph>
                <Antd.Space direction="vertical">
                    <div>
                        <Antd.Radio.Group value={expire === false ? 0 : 1} onChange={e => handleExpireOptionChange(e.target.value)}>
                            <Antd.Radio value={0}>Disable</Antd.Radio>
                            <Antd.Radio value={1}>Enable</Antd.Radio>
                        </Antd.Radio.Group>
                    </div>
                    {expire !== false ?
                        <div>
                            <Antd.DatePicker showTime value={expire ? expire : moment()} onChange={handleExpireChange} />
                        </div>
                    : null }
                </Antd.Space>
            </Antd.Typography.Paragraph>
        </Antd.Modal>
    );
}


