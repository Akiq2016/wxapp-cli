// login example
import Conf from '@/config/index';
import { AccountlogicApi } from '@/services/gatewayService';

const accountlogicApi = new AccountlogicApi();

export default {
    async login(state: any): Promise<any> {
        const self: any = getApp() || this;

        if (self.requestLock.count === 1) {
            return await self.requestLock.request;
        }

        self.requestLock.status = true;
        self.requestLock.count++;
        self.requestLock.request = new Promise(async (resolve, reject) => {
            try {
                const res = await self.wxApi.login();
                console.warn('login', res);

                const loginRes = await accountlogicApi.Login({
                    auth_code: res.code,
                    auth_id: Conf.APP.config.wxAppId,
                    auth_type: 1
                });

                self.commit('login', loginRes);
                resolve(loginRes);
            } catch (error) {
                getApp().wxApi.showToast({
                    title: '登陆失败，请稍后再试！'
                });
                reject(error);
            } finally {
                self.requestLock.status = false;
                self.requestLock.request = null;
                self.requestLock.count = 0;
            }
        });

        try {
            return await self.requestLock.request;
        } catch (error) { }
    },
};
