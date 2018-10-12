import Conf from '@/config';
import { BaseService, IResponse } from '@/services/baseService';
import t from '@/utils/tools';

export class UploadFileService {
    http = new BaseService();
    uriPath: string;

    constructor(uriPath = '') {
        this.uriPath = uriPath;
    }

    upload(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const opt: WXNetAPIUploadFileObj = data;

            opt.url = Conf.APP.config.host + '/' + this._getUriPath(opt.url);
            opt.name = opt.name || Conf.APP.config.file.upload.key;
            opt.formData = Object.assign({}, opt.formData, {
                app_id: Conf.APP.config.appId,
                request_id: t.generateRequestID()
            });

            wx.uploadFile(Object.assign(opt, {
                success: (data: IResponse) => {
                    if (data.statusCode === 200) {
                        const result = JSON.parse(data.data);
                        const path = Conf.APP.config.file.upload.prefix + result.uuid;
                        console.warn('upload success-->', path);
                        resolve({ path, uuid: result.uuid });
                    } else {
                        reject(data.errMsg);
                    }
                },
                fail: (err: IResponse) => {
                    reject(err);
                }
            }));
        });
    }

    private _getUriPath(path?: string): string {
        return this.uriPath + (path
            ? '/' + path
            : '');
    }
}
