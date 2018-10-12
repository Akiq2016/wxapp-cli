interface IEnvironmentMode {
    [key: string]: {
        host: string,
        appId: number,
        creatorId?: string
    };
}

// todo: using NODE_ENV
const env: string = 'production';
const version = '3.0.0';
const isProd = (() => env === 'production')();

const environmentMode: IEnvironmentMode = {
    production: {
        host: 'https://uri.pro',
        appId: 1000001,
    },
    development: {
        host: 'http://uri.dev',
        appId: 1000001
    },
};

const config = {
    wxAppId: 'wxabc1234a1bc1234a',
    file: {
        upload: {
            prefix: 'https://uri.pro/',
            key: 'file'
        },
    }
};

function getCurrentConfig() {
    return Object.assign({}, config, environmentMode[env]);
}

const currentConfig = getCurrentConfig();
console.warn('App configuration', currentConfig);

export default {
    env,
    version,
    isProd,
    config: currentConfig,
};
