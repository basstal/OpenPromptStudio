// customFetch.ts
import fetch from 'node-fetch';
import { RequestInfo, RequestInit, Response } from 'node-fetch';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';

async function customFetch(
    input: RequestInfo,
    init?: RequestInit,
): Promise<Response> {
    const proxy = 'http://127.0.0.1:21882'; // 将代理配置放在代码中

    if (proxy) {
        const url = typeof input === 'string' ? input : input.url;
        const isHttps = url.startsWith('https:');
        const agent = isHttps
            ? new HttpsProxyAgent(proxy)
            : new HttpProxyAgent(proxy);

        init = {
            ...init,
            agent,
        };
    }

    return fetch(input, init);
}

export { customFetch };
