import Conf from '@/config';
import t from '@/utils/tools';

let reLoginTimes = 1;

export interface IRequestExtraConfig {
    isAuth: boolean;
    isLock: boolean;
    hasLoading: boolean;
    [key: string]: any;
}

export interface IResponse {
    statusCode: number;
    data: any;
    errMsg: string;
    header: any;
}

export class BaseService {

    // 获取 http 请求的完整 uri
    getUrl(uri: string): string {
        const { host } = Conf.APP.config;

        if (uri.match(/^http/)) {
            return uri;
        }

        return uri.indexOf('/') === 0
            ? host + uri
            : host + '/' + uri;
    }

    // [review] note: 目前只考虑多并发中有且仅有一个锁 即不兼容并发中多个 lock 为 true 的情况
    async preRequest(req: WXNetAPIRequestObj, config: IRequestExtraConfig): Promise<any> {
        const { hasLoading = false, isLock = false } = config;

        // detect current network
        if (!getApp().state.config.networkStatus.isConnected) {
            getApp().wxApi.showToast({
                title: '网络不见啦!',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        if (hasLoading) {
            getApp().wxApi.showLoading({ title: '加载中' });
        }

        // detect lock status
        if (getApp().requestLock.status && !isLock) {
            console.warn('Ohh, we are waiting for some request finishing first.');

            try {
                await getApp().requestLock.request;
                console.warn('Wow, getApp().requestLock.request success.');
            } catch (error) {
                // if getApp().requestLock.request failed, the following requests should not be executed
                console.warn('Oops, getApp().requestLock.request failed.');
                return;
            }

            return this.request(req, config);
        }

        // lock status === false
        // lock status === true && isLock == true
        return this.request(req, config);
    }

    async request(req: WXNetAPIRequestObj, config: IRequestExtraConfig): Promise<any> {
        const { isAuth = true } = config;
        console.warn('request start, config: ', config);

        req = await this._parseRequest(req as WXNetAPIRequestObj, isAuth);

        return new Promise((resolve, reject) => {
            req.url = this.getUrl(req.url);
            getApp().wxApi.request(req).then(async (res: IResponse) => {
                const { statusCode } = res;

                if (statusCode >= 200 && statusCode <= 300) {
                    return resolve(this._parseResponse(res));
                } else if (statusCode === 401 && reLoginTimes) {
                    reLoginTimes = 0;
                    try {
                        await getApp().dispatch('login');
                        req = await this._parseRequest(req as WXNetAPIRequestObj, isAuth);
                        reLoginTimes = 1;
                        return resolve(await this.request(req, config));
                    } catch (error) {
                        return reject(this._parseResponse(res));
                    }
                } else {
                    return reject(this._parseResponse(res));
                }
            }).catch((err: any) => {
                reject(this._parseResponse(err));
            });
        });
    }

    private async _parseRequest(req: any, isAuth: boolean): Promise<WXNetAPIRequestObj> {
        // 构造 request.data.header
        const header: any = {
            version: Conf.APP.version,
            app_id: Conf.APP.config.appId,
            request_id: t.generateRequestID()
        };

        if (isAuth) {
            const { session, account } = await getApp().dispatch('getProfile');
            header.session_id = session.session_id;
            header.account_id = account.account_id;
        }

        req.data.header = Object.assign({}, req.data.header, header);
        return req;
    }

    private _parseResponse(res: IResponse): any[] {
        // hack
        getApp().wxApi.hideLoading();

        return res.data;
    }
}
