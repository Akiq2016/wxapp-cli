import api from './api';

interface IApiModule {
    [moduleName: string]: {
        [key: string]: {
            url: string;
            type: 'post' | 'get' | 'getGETUrl';
            reqType?: string;
            resType?: string; // add a status
        }
    };
}

export const weblogicApi: IApiModule = {
    storage: {
        Upload: {
            url: 'storage/upload',
            type: 'post'
        }
    },
    wechat: {
        GetWxaCodeUnlimit: {
            url: 'wechat/get_wxa_code_unlimit',
            type: 'getGETUrl'
        }
    }
};

const gatewayReqConf: any = {
    accountlogic: {
        Login: {
            isAuth: false,
            isLock: true
        }
    },
    broadcastlogic: {
        AddArticle: {
            hasLoading: true
        },
        ListArticle: {
            hasLoading: true
        },
        LikeArticle: {
            hasLoading: true
        }
    },
};

export default (() => {
    Object.keys(gatewayReqConf).forEach(moduleName => {
        Object.keys(gatewayReqConf[moduleName]).forEach(apiName => {
            (api as any)[moduleName][apiName] = {
                ...(api as any)[moduleName][apiName],
                ...gatewayReqConf[moduleName][apiName]
            };
        });
    });
    return api;
})();
