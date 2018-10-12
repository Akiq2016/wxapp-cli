import router from '@/config/route';

interface IOtions {
    router: {
        alias: string,
        params?: {
            [key: string]: any
        }
    };
    title?: string;
    imageUrl?: string;
}

export function shareApp(options: IOtions) {
    const currentRouter = options.router;
    let { url: path } = router.ROUTE;
    let query;

    path = `${path}?realPathAlias=${currentRouter.alias}`;

    if (currentRouter.params && Object.keys(currentRouter.params).length !== 0) {
        query = Object.keys(currentRouter.params).map(key =>
            `${key}=${(currentRouter.params as any)[key]}`
        ).join('&');

        delete options.router;
        path = `${path}&${query}`;
    }

    return {
        ...options,
        path: `${path}`
    };
}
