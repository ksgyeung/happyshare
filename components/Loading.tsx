import React from "react";
import * as Antd from 'antd';

import style from './Loading.module.css';

export default function Loading()
{
    return (
        <div className={style.fullScreen}>
            <div className={style.center}>
                <Antd.Spin size="large" />
            </div>
        </div>
    )
}