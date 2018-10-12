import Event from '@/libs/event';
import Store from '@/store/index.js';
import wxApi from '@/utils/wxApi';

// dispatch request lock
const requestLock: {
    status: boolean;
    request: Promise<any> | null,
    count: number,
} = {
    status: false, // lock status
    request: null, // request method
    count: 0, // current locking request count (resolve concurrent lock problem)
};

App(Object.assign({
    wxApi,
    Event: new Event(),
    requestLock,
    // NOTE: when adding methods in onLaunch hook, you should consider
    // if some pages' onLoad hook stuffs depend on these methods response.
    // Please try to give a initial value or control the invoking sequence.
    async onLaunch (options: any) {
        // init store
        Store.createStore.call(this);

        // detect network
        this.dispatch('detectNetwork');

        await this.dispatch('login');
    },
    onShow (options: any) {

    },
    onHide () {

    },
    onError () {

    },
    onPageNotFound () {

    },
}, Store));
