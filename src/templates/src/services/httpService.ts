import { BaseService, IRequestExtraConfig } from '@/services/baseService';

export interface IRequestParams {
    method: string;
    url: string;
    data?: object;
    params?: object;
}

export class HttpService {

    base = new BaseService();
    uriPrefix: string;

    constructor(uriPrefix = '') {
        this.uriPrefix = uriPrefix;
    }

    post(data: any = {}, config: IRequestExtraConfig): Promise<any> {
        const req: IRequestParams = {
            url: this._getUriPath(config.url),
            method: 'post',
            data
        };

        return this.base.preRequest(req, config);
    }

    // [review] update getGETUrl if req.url changed
    get(data: any = {}, config: IRequestExtraConfig): Promise<any> {
        const req: IRequestParams = {
            url: this._getUriPath(config.url) + '?data=' + encodeURIComponent(JSON.stringify(data)),
            method: 'get'
        };

        return this.base.preRequest(req, config);
    }

    getGETUrl(data: any, config: IRequestExtraConfig) {
        return this._getUriPath(config.url) + '?data=' + encodeURIComponent(JSON.stringify(data));
    }

    // e.g. /gateway/login
    private _getUriPath(path?: string): string {
        if (path && path.match(/^http/)) {
            return path;
        }

        return this.uriPrefix + (path
            ? '/' + path
            : '');
    }
}
