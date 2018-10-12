// use interface to validate input.
interface IRouteModule {
    [moduleName: string]: {
        url: string;
    };
}

// review: onShareAppMessage's realPathAlias use below key!
const config: IRouteModule = {
    ROUTE: {
        url: 'route'
    },
    HOME: {
        url: 'home'
    },
    GAME_POSTER: {
        url: 'poster'
    },
    GROUP_OCUPPY: {
        url: 'groupOcuppy'
    },
};

/**
 * 根据 pagename 自动补全路径
 * (文件命名规则为 /pages/pagename/pagename.[ts/scss/json/wxml])
 */
function prefixRouter(routesConf: IRouteModule): IRouteModule {
    const res: IRouteModule = {};

    for (const route in routesConf) {
        const url = routesConf[route].url;
        const temp = url.split('/');

        if (temp[0] === 'pages') {
            res[route] = {
                ...routesConf[route]
            };
        } else {
            res[route] = {
                ...routesConf[route],
                url: `/pages/${url}/${temp[temp.length - 1]}`
            };
        }
    }
    return res;
}

export default prefixRouter(config);
